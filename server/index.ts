import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { z } from 'zod';
import crypto from 'crypto';
import winston from 'winston';
import { getDb } from '../src/lib/database/connection';
import { dashboardOrders, dashboardCustomers, tenants, webhookLogs } from '../src/lib/database/schemas/tenants';
import { encryptData, decryptData } from '../src/lib/encryption/crypto';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { format } from 'date-fns';

// Type coercion helper
const ensureNumber = (value: string | number): number => typeof value === 'string' ? parseInt(value, 10) : value;

// Initialize Express app
const app: Application = express();
const PORT = process.env.API_PORT || 3001;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'shoplytics-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware setup
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'X-Shopify-Topic', 'X-Shopify-Hmac-Sha256']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // Higher limit for webhooks
  message: {
    error: 'Webhook rate limit exceeded',
    retryAfter: '5 minutes'
  }
});

app.use('/api', generalLimiter);
app.use('/api/shopify/webhook', webhookLimiter);

// Validation schemas
const TenantRegistrationSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  shopifyStoreUrl: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/),
  shopifyAccessToken: z.string().min(1),
  webhookSecret: z.string().optional(),
  planType: z.enum(['starter', 'professional', 'enterprise']).default('starter')
});

const ShopifyWebhookSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  total_price: z.string(),
  subtotal_price: z.string().optional(),
  total_tax: z.string().optional(),
  currency: z.string().default('USD'),
  financial_status: z.string(),
  fulfillment_status: z.string().optional(),
  customer: z.object({
    id: z.number(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string()
  }).optional(),
  line_items: z.array(z.object({
    id: z.number(),
    product_id: z.number().optional(),
    variant_id: z.number().optional(),
    title: z.string(),
    quantity: z.number(),
    price: z.string(),
    sku: z.string().optional(),
    vendor: z.string().optional()
  })).optional()
});

// Authentication middleware
const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required',
        message: 'Please provide a valid API key in X-API-Key header'
      });
    }

    const db = getDb();
    const tenant = await db.select()
      .from(tenants)
      .where(eq(tenants.apiKey, apiKey))
      .limit(1);

    if (!tenant.length || !tenant[0].isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid or inactive'
      });
    }

    // Add tenant to request object
    (req as any).tenant = tenant[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Unable to authenticate request'
    });
  }
};

// Shopify webhook verification
const verifyShopifyWebhook = (req: Request, res: Response, next: NextFunction) => {
  const hmac = req.headers['x-shopify-hmac-sha256'] as string;
  const body = JSON.stringify(req.body);
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!hmac || !tenantId) {
    return res.status(401).json({
      success: false,
      error: 'Missing webhook verification headers'
    });
  }

  // In production, verify HMAC with tenant's webhook secret
  // const expectedHmac = crypto.createHmac('sha256', webhookSecret).update(body).digest('base64');
  // For demo, we'll skip verification but log the attempt
  logger.info(`Webhook verification for tenant ${tenantId}`, { hmac: hmac.substring(0, 10) + '...' });
  
  (req as any).tenantId = tenantId;
  next();
};

// Utility functions
const generateApiKey = (): string => {
  return `sk_${crypto.randomBytes(24).toString('hex')}`;
};

const generateWebhookSecret = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// =============================================================================
// ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'shoplytics-api'
  });
});

// =============================================================================
// 1. POST /api/shopify/webhook - Receive Shopify webhook data
// =============================================================================
app.post('/api/shopify/webhook', verifyShopifyWebhook, async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt((req as any).tenantId);
    const webhook = ShopifyWebhookSchema.parse(req.body);
    
    logger.info(`Processing Shopify webhook for tenant ${tenantId}`, { 
      orderId: webhook.id,
      topic: req.headers['x-shopify-topic'] 
    });

    const db = getDb();
    
    // Get tenant's encryption key (in production, retrieve from secure storage)
    const tenantKey = process.env.DEMO_ENCRYPTION_KEY || 'demo-key-for-development';

    // Process customer data if present
    let customerId: number | null = null;
    
    if (webhook.customer) {
      const existingCustomer = await db.select()
        .from(dashboardCustomers)
        .where(and(
          eq(dashboardCustomers.tenantId, tenantId),
          eq(dashboardCustomers.shopifyCustomerId, webhook.customer.id.toString())
        ))
        .limit(1);

      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        // Update existing customer
        await db.update(dashboardCustomers)
          .set({
            ordersCount: (existingCustomer[0].ordersCount || 0) + 1,
            totalSpent: (parseFloat(existingCustomer[0].totalSpent || '0') + parseFloat(webhook.total_price)).toFixed(2),
            lastOrderDate: new Date(),
            updatedAt: new Date()
          })
          .where(eq(dashboardCustomers.id, customerId));
      } else {
        // Create new customer with encrypted data
        const newCustomer = await db.insert(dashboardCustomers).values({
          tenantId,
          shopifyCustomerId: webhook.customer.id.toString(),
          email: encryptData(webhook.customer.email, tenantKey),
          firstName: encryptData(webhook.customer.first_name, tenantKey),
          lastName: encryptData(webhook.customer.last_name, tenantKey),
          phone: webhook.customer.phone ? encryptData(webhook.customer.phone, tenantKey) : null,
          ordersCount: 1,
          totalSpent: webhook.total_price,
          state: 'enabled',
          acceptsMarketing: false,
          lastOrderDate: new Date(),
          shopifyCreatedAt: new Date(webhook.customer.created_at),
          shopifyUpdatedAt: new Date(webhook.customer.updated_at)
        }).returning();
        
        customerId = newCustomer[0].id;
      }
    }

    // Create order record
    const newOrder = await db.insert(dashboardOrders).values({
      tenantId,
      customerId,
      shopifyOrderId: webhook.id.toString(),
      orderNumber: webhook.name,
      email: webhook.customer?.email ? encryptData(webhook.customer.email, tenantKey) : null,
      totalPrice: webhook.total_price,
      subtotalPrice: webhook.subtotal_price || webhook.total_price,
      totalTax: webhook.total_tax || '0.00',
      totalDiscounts: '0.00',
      shippingPrice: '0.00',
      currency: webhook.currency,
      financialStatus: webhook.financial_status,
      fulfillmentStatus: webhook.fulfillment_status || 'unfulfilled',
      source: 'shopify',
      orderDate: new Date(webhook.created_at),
      processedAt: new Date(),
      cancelledAt: null,
      lineItems: webhook.line_items || [],
      billingAddress: null,
      shippingAddress: null,
      discountCodes: [],
      shopifyCreatedAt: new Date(webhook.created_at),
      shopifyUpdatedAt: new Date(webhook.updated_at)
    }).returning();

    logger.info(`Successfully processed webhook for order ${webhook.id}`, {
      tenantId,
      orderId: newOrder[0].id,
      customerId
    });

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      data: {
        orderId: newOrder[0].id,
        customerId,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Webhook processing error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: 'Internal server error occurred while processing the webhook'
    });
  }
});

// =============================================================================
// 2. GET /api/analytics/overview/:tenantId - Return dashboard summary stats
// =============================================================================
app.get('/api/analytics/overview/:tenantId', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const { from, to } = req.query;
    
    // Validate tenant ownership
    const tenant = (req as any).tenant;
    if (tenant.id.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access data for your own tenant'
      });
    }

    const db = getDb();

    // Build date filters
    const dateFilters = [eq(dashboardOrders.tenantId, tenantId)];
    if (from) {
      dateFilters.push(gte(dashboardOrders.processedAt, new Date(from as string)));
    }
    if (to) {
      dateFilters.push(lte(dashboardOrders.processedAt, new Date(to as string)));
    }

    // Get current period stats
    const currentStats = await db
      .select({
        totalOrders: sql<number>`count(${dashboardOrders.id})`,
        totalRevenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}::numeric), 0)`,
        uniqueCustomers: sql<number>`count(distinct ${dashboardOrders.customerId})`
      })
      .from(dashboardOrders)
      .where(and(...dateFilters, eq(dashboardOrders.financialStatus, 'paid')));

    // Calculate previous period for growth comparison
    const periodLength = from && to 
      ? new Date(to as string).getTime() - new Date(from as string).getTime()
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const prevFrom = new Date((from ? new Date(from as string) : new Date()).getTime() - periodLength);
    const prevTo = new Date((to ? new Date(to as string) : new Date()).getTime() - periodLength);

    const previousStats = await db
      .select({
        totalOrders: sql<number>`count(${dashboardOrders.id})`,
        totalRevenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}::numeric), 0)`,
        uniqueCustomers: sql<number>`count(distinct ${dashboardOrders.customerId})`
      })
      .from(dashboardOrders)
      .where(and(
        eq(dashboardOrders.tenantId, tenantId),
        eq(dashboardOrders.financialStatus, 'paid'),
        gte(dashboardOrders.processedAt, prevFrom),
        lte(dashboardOrders.processedAt, prevTo)
      ));

    // Get total customers for tenant
    const totalCustomersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.tenantId, tenantId));

    const current = currentStats[0];
    const previous = previousStats[0];
    const totalCustomers = totalCustomersResult[0].count;

    // Calculate average order value
    const averageOrderValue = current.totalOrders > 0 
      ? Math.round((current.totalRevenue / current.totalOrders) * 100) / 100
      : 0;

    const overview = {
      totalCustomers,
      totalOrders: current.totalOrders,
      totalRevenue: Math.round(current.totalRevenue * 100) / 100,
      averageOrderValue,
      revenueGrowth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
      ordersGrowth: calculateGrowth(current.totalOrders, previous.totalOrders),
      customersGrowth: calculateGrowth(current.uniqueCustomers, previous.uniqueCustomers)
    };

    res.json({
      success: true,
      data: overview,
      period: {
        from: from || 'all time',
        to: to || 'now',
        previousPeriod: {
          from: prevFrom.toISOString(),
          to: prevTo.toISOString()
        }
      }
    });

  } catch (error) {
    logger.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics overview',
      message: 'An error occurred while processing your request'
    });
  }
});

// =============================================================================
// 3. GET /api/analytics/orders/:tenantId - Return orders with date filtering
// =============================================================================
app.get('/api/analytics/orders/:tenantId', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { from, to, groupBy = 'day', limit = '100' } = req.query;
    
    // Validate tenant ownership
    const tenant = (req as any).tenant;
    if (tenant.id.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const db = getDb();

    // Validate groupBy parameter
    const validGroupBy = ['day', 'week', 'month'];
    if (!validGroupBy.includes(groupBy as string)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid groupBy parameter',
        message: 'groupBy must be one of: day, week, month'
      });
    }

    // Build date filters
    const dateFilters = [eq(dashboardOrders.tenantId, tenantId)];
    if (from) {
      dateFilters.push(gte(dashboardOrders.processedAt, new Date(from as string)));
    }
    if (to) {
      dateFilters.push(lte(dashboardOrders.processedAt, new Date(to as string)));
    }

    // Build date grouping SQL
    let dateGroupSql: any;
    let dateFormatSql: any;

    switch (groupBy) {
      case 'week':
        dateGroupSql = sql`DATE_TRUNC('week', ${dashboardOrders.processedAt})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('week', ${dashboardOrders.processedAt}), 'YYYY-MM-DD')`;
        break;
      case 'month':
        dateGroupSql = sql`DATE_TRUNC('month', ${dashboardOrders.processedAt})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('month', ${dashboardOrders.processedAt}), 'YYYY-MM-DD')`;
        break;
      default: // day
        dateGroupSql = sql`DATE_TRUNC('day', ${dashboardOrders.processedAt})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('day', ${dashboardOrders.processedAt}), 'YYYY-MM-DD')`;
    }

    // Query orders grouped by date
    const ordersData = await db
      .select({
        date: dateFormatSql,
        orders: sql<number>`count(${dashboardOrders.id})`,
        revenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}::numeric), 0)`
      })
      .from(dashboardOrders)
      .where(and(...dateFilters))
      .groupBy(dateGroupSql)
      .orderBy(dateGroupSql)
      .limit(parseInt(limit as string));

    // Transform data for frontend
    const transformedData = ordersData.map((row) => ({
      date: row.date,
      orders: row.orders,
      revenue: Math.round(row.revenue * 100) / 100
    }));

    res.json({
      success: true,
      data: transformedData,
      meta: {
        groupBy: groupBy as string,
        period: { from, to },
        totalRecords: transformedData.length
      }
    });

  } catch (error) {
    logger.error('Orders analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders analytics'
    });
  }
});

// =============================================================================
// 4. GET /api/analytics/customers/top/:tenantId - Return top customers by spend
// =============================================================================
app.get('/api/analytics/customers/top/:tenantId', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { limit = '5' } = req.query;
    
    // Validate tenant ownership
    const tenant = (req as any).tenant;
    if (tenant.id.toString() !== tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const db = getDb();
    const maxLimit = Math.min(parseInt(limit as string), 50); // Max 50 customers

    // Get top customers by total spent
    const topCustomersData = await db
      .select({
        id: dashboardCustomers.id,
        firstName: dashboardCustomers.firstName,
        lastName: dashboardCustomers.lastName,
        email: dashboardCustomers.email,
        totalSpent: dashboardCustomers.totalSpent,
        ordersCount: dashboardCustomers.ordersCount,
        lastOrderDate: dashboardCustomers.lastOrderDate,
        state: dashboardCustomers.state
      })
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.tenantId, tenantId))
      .orderBy(desc(sql`${dashboardCustomers.totalSpent}::numeric`))
      .limit(maxLimit);

    // Decrypt customer data and transform for frontend
    const tenantKey = process.env.DEMO_ENCRYPTION_KEY || 'demo-key-for-development';
    
    const topCustomers = topCustomersData.map((customer) => {
      try {
        return {
          id: customer.id,
          name: `${decryptData(customer.firstName || '', tenantKey)} ${decryptData(customer.lastName || '', tenantKey)}`.trim() || 'Unknown Customer',
          email: customer.email ? decryptData(customer.email, tenantKey) : '',
          totalSpent: parseFloat(customer.totalSpent || '0'),
          ordersCount: customer.ordersCount || 0,
          lastOrderDate: customer.lastOrderDate ? customer.lastOrderDate.toISOString() : null,
          state: customer.state || 'enabled'
        };
      } catch (decryptError) {
        logger.warn('Failed to decrypt customer data', { customerId: customer.id });
        return {
          id: customer.id,
          name: 'Protected Customer',
          email: 'protected@example.com',
          totalSpent: parseFloat(customer.totalSpent || '0'),
          ordersCount: customer.ordersCount || 0,
          lastOrderDate: customer.lastOrderDate ? customer.lastOrderDate.toISOString() : null,
          state: customer.state || 'enabled'
        };
      }
    });

    res.json({
      success: true,
      data: topCustomers,
      meta: {
        totalRecords: topCustomers.length,
        limit: maxLimit
      }
    });

  } catch (error) {
    logger.error('Top customers analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top customers'
    });
  }
});

// =============================================================================
// 5. POST /api/tenant/register - Tenant onboarding with API key generation
// =============================================================================
app.post('/api/tenant/register', async (req: Request, res: Response) => {
  try {
    const registrationData = TenantRegistrationSchema.parse(req.body);
    
    logger.info('Processing tenant registration', { 
      name: registrationData.name,
      email: registrationData.email,
      store: registrationData.shopifyStoreUrl 
    });

    const db = getDb();

    // Check if tenant already exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.shopifyStoreUrl, registrationData.shopifyStoreUrl))
      .limit(1);

    if (existingTenant.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Tenant already exists',
        message: 'A tenant with this Shopify store URL is already registered'
      });
    }

    // Generate unique API key and webhook secret
    const apiKey = generateApiKey();
    const webhookSecret = registrationData.webhookSecret || generateWebhookSecret();

    // Create new tenant (in production, encrypt sensitive data)
    const newTenant = await db
      .insert(tenants)
      .values({
        name: registrationData.name,
        shopifyStoreUrl: registrationData.shopifyStoreUrl,
        apiKey,
        shopifyAccessToken: registrationData.shopifyAccessToken, // Should be encrypted in production
        webhookSecret,
        isActive: true,
        settings: {
          dataRetentionDays: 365,
          encryptionEnabled: true,
          webhookEndpoints: [`${process.env.BASE_URL || 'http://localhost:3001'}/api/shopify/webhook`]
        }
      })
      .returning({
        id: tenants.id,
        name: tenants.name,
        shopifyStoreUrl: tenants.shopifyStoreUrl,
        apiKey: tenants.apiKey,
        webhookSecret: tenants.webhookSecret,
        createdAt: tenants.createdAt
      });

    logger.info('Tenant registered successfully', { 
      tenantId: newTenant[0].id,
      store: newTenant[0].shopifyStoreUrl 
    });

    res.status(201).json({
      success: true,
      message: 'Tenant registered successfully',
      data: {
        tenant: newTenant[0],
        nextSteps: [
          'Configure your Shopify webhooks to point to our endpoint',
          'Test webhook integration with a sample order',
          'Start monitoring your analytics dashboard'
        ],
        webhookEndpoint: `${process.env.BASE_URL || 'http://localhost:3001'}/api/shopify/webhook`,
        documentation: `${process.env.BASE_URL || 'http://localhost:3001'}/docs`
      }
    });

  } catch (error) {
    logger.error('Tenant registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid registration data',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to register tenant',
      message: 'An error occurred while processing your registration'
    });
  }
});

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// Handle 404 errors
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'POST /api/shopify/webhook',
      'GET /api/analytics/overview/:tenantId',
      'GET /api/analytics/orders/:tenantId',
      'GET /api/analytics/customers/top/:tenantId',
      'POST /api/tenant/register'
    ]
  });
});

// Global error handler
app.use((error: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  logger.error('Global error handler:', error);
  
  // Don't send error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
});

// =============================================================================
// START SERVER
// =============================================================================

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Shoplytics API server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
