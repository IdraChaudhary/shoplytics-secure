import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logError, logInfo, timeOperation } from '@/lib/monitoring';

// Webhook security configuration
const WEBHOOK_CONFIG = {
  secret: process.env.SHOPIFY_WEBHOOK_SECRET,
  maxPayloadSize: 1024 * 1024, // 1MB
  timeout: 30000, // 30 seconds
  requiredHeaders: ['x-shopify-topic', 'x-shopify-hmac-sha256', 'x-shopify-shop-domain'],
};

// Supported webhook topics
const WEBHOOK_TOPICS = {
  'orders/create': handleOrderCreate,
  'orders/updated': handleOrderUpdate,
  'orders/paid': handleOrderPaid,
  'orders/cancelled': handleOrderCancelled,
  'products/create': handleProductCreate,
  'products/update': handleProductUpdate,
  'customers/create': handleCustomerCreate,
  'customers/update': handleCustomerUpdate,
  'app/uninstalled': handleAppUninstalled,
} as const;

// Verify webhook signature
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    const calculatedSignature = hmac.digest('base64');
    
    // Use timingSafeEqual to prevent timing attacks
    const providedSignature = Buffer.from(signature, 'base64');
    const calculatedBuffer = Buffer.from(calculatedSignature, 'base64');
    
    if (providedSignature.length !== calculatedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(providedSignature, calculatedBuffer);
  } catch (error) {
    logError('Webhook signature verification failed', { error, signature });
    return false;
  }
}

// Validate request headers and SSL
function validateWebhookRequest(request: NextRequest): { isValid: boolean; error?: string } {
  // Check required headers
  for (const header of WEBHOOK_CONFIG.requiredHeaders) {
    if (!request.headers.get(header)) {
      return { isValid: false, error: `Missing required header: ${header}` };
    }
  }

  // Check if request is over HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol;
    if (proto !== 'https:') {
      return { isValid: false, error: 'HTTPS required for webhook endpoints' };
    }
  }

  // Validate shop domain format
  const shopDomain = request.headers.get('x-shopify-shop-domain');
  if (shopDomain && !shopDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
    return { isValid: false, error: 'Invalid shop domain format' };
  }

  return { isValid: true };
}

// Get tenant from shop domain
async function getTenantFromShop(shopDomain: string) {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        shopDomain: shopDomain,
        isActive: true
      }
    });
    return tenant;
  } catch (error) {
    logError('Failed to find tenant for shop domain', { shopDomain, error });
    return null;
  }
}

// Webhook handlers
async function handleOrderCreate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_order_create');
  
  try {
    // Process order creation
    logInfo('Processing order create webhook', {
      orderId: payload.id,
      tenantId: tenant.id,
      orderTotal: payload.total_price,
    });

    // Here you would implement actual order processing logic
    // For example: sync order to database, update analytics, etc.
    
    endTiming('success');
    return { processed: true, orderId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleOrderUpdate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_order_update');
  
  try {
    logInfo('Processing order update webhook', {
      orderId: payload.id,
      tenantId: tenant.id,
    });
    
    endTiming('success');
    return { processed: true, orderId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleOrderPaid(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_order_paid');
  
  try {
    logInfo('Processing order paid webhook', {
      orderId: payload.id,
      tenantId: tenant.id,
      totalPrice: payload.total_price,
    });
    
    endTiming('success');
    return { processed: true, orderId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleOrderCancelled(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_order_cancelled');
  
  try {
    logInfo('Processing order cancelled webhook', {
      orderId: payload.id,
      tenantId: tenant.id,
    });
    
    endTiming('success');
    return { processed: true, orderId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleProductCreate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_product_create');
  
  try {
    logInfo('Processing product create webhook', {
      productId: payload.id,
      tenantId: tenant.id,
      productTitle: payload.title,
    });
    
    endTiming('success');
    return { processed: true, productId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleProductUpdate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_product_update');
  
  try {
    logInfo('Processing product update webhook', {
      productId: payload.id,
      tenantId: tenant.id,
    });
    
    endTiming('success');
    return { processed: true, productId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleCustomerCreate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_customer_create');
  
  try {
    logInfo('Processing customer create webhook', {
      customerId: payload.id,
      tenantId: tenant.id,
      customerEmail: payload.email,
    });
    
    endTiming('success');
    return { processed: true, customerId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleCustomerUpdate(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_customer_update');
  
  try {
    logInfo('Processing customer update webhook', {
      customerId: payload.id,
      tenantId: tenant.id,
    });
    
    endTiming('success');
    return { processed: true, customerId: payload.id };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

async function handleAppUninstalled(payload: any, tenant: any) {
  const endTiming = timeOperation('webhook_app_uninstalled');
  
  try {
    logInfo('Processing app uninstalled webhook', {
      tenantId: tenant.id,
      shopDomain: payload.domain,
    });

    // Deactivate tenant
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { isActive: false, status: 'INACTIVE' }
    })
    
    endTiming('success');
    return { processed: true, deactivated: true };
  } catch (error) {
    endTiming('error');
    throw error;
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate request
    const validation = validateWebhookRequest(request);
    if (!validation.isValid) {
      logError('Webhook validation failed', { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get request details
    const topic = request.headers.get('x-shopify-topic');
    const signature = request.headers.get('x-shopify-hmac-sha256');
    const shopDomain = request.headers.get('x-shopify-shop-domain');

    if (!WEBHOOK_CONFIG.secret) {
      logError('Webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.text();
    
    // Check payload size
    if (body.length > WEBHOOK_CONFIG.maxPayloadSize) {
      logError('Webhook payload too large', { size: body.length });
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Verify signature
    if (!verifyWebhookSignature(body, signature!, WEBHOOK_CONFIG.secret)) {
      logError('Webhook signature verification failed', {
        topic,
        shopDomain,
        signatureProvided: !!signature,
      });
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      logError('Invalid JSON payload', { error, topic, shopDomain });
      return NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      );
    }

    // Find tenant
    const tenant = await getTenantFromShop(shopDomain!);
    if (!tenant) {
      logError('Tenant not found for shop domain', { shopDomain, topic });
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Process webhook based on topic
    const handler = WEBHOOK_TOPICS[topic as keyof typeof WEBHOOK_TOPICS];
    if (!handler) {
      logError('Unsupported webhook topic', { topic, shopDomain });
      return NextResponse.json(
        { error: 'Unsupported webhook topic' },
        { status: 400 }
      );
    }

    // Process webhook with timeout
    const result = await Promise.race([
      handler(payload, tenant),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Webhook processing timeout')), WEBHOOK_CONFIG.timeout)
      )
    ]);

    logInfo('Webhook processed successfully', {
      topic,
      shopDomain,
      tenantId: tenant.id,
      processingTime: Date.now() - startTime,
      result,
    });

    return NextResponse.json({
      success: true,
      topic,
      processed: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logError('Webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime,
      topic: request.headers.get('x-shopify-topic'),
      shopDomain: request.headers.get('x-shopify-shop-domain'),
    });

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'shopify-webhooks',
    supportedTopics: Object.keys(WEBHOOK_TOPICS),
    timestamp: new Date().toISOString(),
  });
}
