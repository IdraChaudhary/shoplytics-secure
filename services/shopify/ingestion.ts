import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { 
  ShopifyClient, 
  ShopifyClientManager, 
  ShopifyCredentials,
  createShopifyClient 
} from './client';
import { 
  ShopifyImportService, 
  ImportResult, 
  ImportOptions, 
  createImportService 
} from './import';
import { 
  ShopifyWebhookService, 
  createWebhookService,
  createWebhookMiddleware 
} from './webhooks';
import { 
  ShopifySchedulerService, 
  SyncJobConfig,
  createSchedulerService 
} from './scheduler';
import { Express, Request, Response } from 'express';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/shopify-ingestion.log' })
  ]
});

export interface IngestionServiceConfig {
  scheduler: {
    enabled: boolean;
    config?: SyncJobConfig;
  };
  webhooks: {
    enabled: boolean;
    endpoint: string;
  };
  import: {
    defaultOptions: ImportOptions;
  };
}

export interface TenantSyncStatus {
  tenantId: string;
  tenantName: string;
  shopDomain: string;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed';
  stats: {
    customers: number;
    products: number;
    orders: number;
  };
  healthStatus: boolean;
  rateLimitStatus?: {
    callsMade: number;
    bucketSize: number;
    isLimited: boolean;
  };
}

export class ShopifyIngestionService {
  private prisma: PrismaClient;
  private clientManager: ShopifyClientManager;
  private webhookService: ShopifyWebhookService;
  private schedulerService: ShopifySchedulerService;
  private config: IngestionServiceConfig;
  private initialized: boolean = false;

  constructor(prisma: PrismaClient, config: IngestionServiceConfig) {
    this.prisma = prisma;
    this.config = config;
    this.clientManager = new ShopifyClientManager();
    this.webhookService = createWebhookService(prisma);
    this.schedulerService = createSchedulerService(prisma, this.clientManager);
  }

  // Initialize the ingestion service
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Shopify Ingestion Service', this.config);

      // Load existing tenants and create Shopify clients
      await this.loadTenants();

      // Start scheduler if enabled
      if (this.config.scheduler.enabled) {
        await this.schedulerService.startScheduler();
        logger.info('Scheduler started successfully');
      }

      this.initialized = true;
      logger.info('Shopify Ingestion Service initialized successfully');

    } catch (error) {
      logger.error('Error initializing Shopify Ingestion Service', { error: error.message });
      throw error;
    }
  }

  // Load tenants and create Shopify clients
  private async loadTenants(): Promise<void> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          isActive: true,
          shopDomain: { not: null },
          shopifyAccessToken: { not: null }
        }
      });

      logger.info(`Loading ${tenants.length} active tenants with Shopify integration`);

      for (const tenant of tenants) {
        try {
          const credentials: ShopifyCredentials = {
            shopDomain: tenant.shopDomain!,
            accessToken: tenant.shopifyAccessToken!
          };

          this.clientManager.addClient(tenant.id, credentials);
          logger.info(`Added Shopify client for tenant: ${tenant.name} (${tenant.id})`);

        } catch (error) {
          logger.error(`Error creating Shopify client for tenant ${tenant.id}`, {
            error: error.message
          });
        }
      }

      logger.info(`Successfully loaded ${this.clientManager.getAllClients().size} Shopify clients`);
    } catch (error) {
      logger.error('Error loading tenants', { error: error.message });
      throw error;
    }
  }

  // Setup webhook endpoints in Express app
  setupWebhookEndpoints(app: Express): void {
    if (!this.config.webhooks.enabled) {
      logger.info('Webhooks disabled, skipping endpoint setup');
      return;
    }

    const webhookMiddleware = createWebhookMiddleware(this.prisma);

    // Main webhook endpoint
    app.post(this.config.webhooks.endpoint, webhookMiddleware);

    logger.info(`Webhook endpoint configured at: ${this.config.webhooks.endpoint}`);
  }

  // Add or update a tenant's Shopify integration
  async addTenant(
    tenantId: string, 
    credentials: ShopifyCredentials,
    syncConfig?: SyncJobConfig
  ): Promise<void> {
    try {
      logger.info(`Adding Shopify integration for tenant: ${tenantId}`);

      // Test credentials by creating client and checking health
      const testClient = createShopifyClient(credentials);
      const isHealthy = await testClient.healthCheck();

      if (!isHealthy) {
        throw new Error('Shopify API health check failed for provided credentials');
      }

      // Add client to manager
      this.clientManager.addClient(tenantId, credentials);

      // Update tenant record with Shopify info
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          shopDomain: credentials.shopDomain,
          shopifyAccessToken: credentials.accessToken,
          isActive: true
        }
      });

      // Schedule sync jobs for the tenant if scheduler is enabled
      if (this.config.scheduler.enabled && this.initialized) {
        await this.schedulerService.scheduleTenantJobs(tenantId, syncConfig);
      }

      logger.info(`Successfully added Shopify integration for tenant: ${tenantId}`);

    } catch (error) {
      logger.error(`Error adding tenant ${tenantId}`, { error: error.message });
      throw error;
    }
  }

  // Remove a tenant's Shopify integration
  async removeTenant(tenantId: string): Promise<void> {
    try {
      logger.info(`Removing Shopify integration for tenant: ${tenantId}`);

      // Remove client from manager
      this.clientManager.removeClient(tenantId);

      // Update tenant record
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          shopDomain: null,
          shopifyAccessToken: null
        }
      });

      // Disable scheduled jobs for the tenant
      if (this.config.scheduler.enabled) {
        const tenantJobs = this.schedulerService.getJobsByTenant(tenantId);
        for (const job of tenantJobs) {
          this.schedulerService.disableJob(job.id);
        }
      }

      logger.info(`Successfully removed Shopify integration for tenant: ${tenantId}`);

    } catch (error) {
      logger.error(`Error removing tenant ${tenantId}`, { error: error.message });
      throw error;
    }
  }

  // Manual data import for a tenant
  async importData(
    tenantId: string, 
    dataType: 'customers' | 'products' | 'orders' | 'all',
    options: ImportOptions = this.config.import.defaultOptions
  ): Promise<ImportResult | { customers: ImportResult; products: ImportResult; orders: ImportResult }> {
    try {
      logger.info(`Starting manual data import for tenant: ${tenantId}`, {
        dataType,
        options
      });

      const client = this.clientManager.getClient(tenantId);
      if (!client) {
        throw new Error(`No Shopify client found for tenant: ${tenantId}`);
      }

      const importService = createImportService(this.prisma, client, tenantId, options);

      let result;
      switch (dataType) {
        case 'customers':
          result = await importService.importCustomers(options);
          break;
        case 'products':
          result = await importService.importProducts(options);
          break;
        case 'orders':
          result = await importService.importOrders(options);
          break;
        case 'all':
          result = await importService.importAll(options);
          break;
        default:
          throw new Error(`Invalid data type: ${dataType}`);
      }

      logger.info(`Manual data import completed for tenant: ${tenantId}`, { result });
      return result;

    } catch (error) {
      logger.error(`Error importing data for tenant ${tenantId}`, {
        dataType,
        error: error.message
      });
      throw error;
    }
  }

  // Get sync status for all tenants
  async getSyncStatus(): Promise<TenantSyncStatus[]> {
    try {
      const tenants = await this.prisma.tenant.findMany({
        where: {
          shopDomain: { not: null }
        }
      });

      const statusList: TenantSyncStatus[] = [];

      for (const tenant of tenants) {
        try {
          const client = this.clientManager.getClient(tenant.id);
          const healthStatus = client ? await client.healthCheck() : false;
          
          // Get data counts
          const [customers, products, orders] = await Promise.all([
            this.prisma.customer.count({ where: { tenantId: tenant.id } }),
            this.prisma.product.count({ where: { tenantId: tenant.id } }),
            this.prisma.order.count({ where: { tenantId: tenant.id } })
          ]);

          // Get last sync timestamp
          const lastOrder = await this.prisma.order.findFirst({
            where: { tenantId: tenant.id },
            orderBy: { shopifyUpdatedAt: 'desc' },
            select: { shopifyUpdatedAt: true }
          });

          // Get rate limit info
          const rateLimitStatus = client ? (() => {
            const info = client.getRateLimitInfo();
            return info ? {
              callsMade: info.callsMade,
              bucketSize: info.bucketSize,
              isLimited: client.isRateLimited()
            } : undefined;
          })() : undefined;

          statusList.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            shopDomain: tenant.shopDomain!,
            isActive: tenant.isActive,
            lastSync: lastOrder?.shopifyUpdatedAt,
            syncStatus: 'idle', // Would need to track this in real implementation
            stats: { customers, products, orders },
            healthStatus,
            rateLimitStatus
          });

        } catch (error) {
          logger.error(`Error getting status for tenant ${tenant.id}`, {
            error: error.message
          });

          statusList.push({
            tenantId: tenant.id,
            tenantName: tenant.name,
            shopDomain: tenant.shopDomain!,
            isActive: tenant.isActive,
            syncStatus: 'failed',
            stats: { customers: 0, products: 0, orders: 0 },
            healthStatus: false
          });
        }
      }

      return statusList;

    } catch (error) {
      logger.error('Error getting sync status', { error: error.message });
      throw error;
    }
  }

  // Get service health status
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      clients: number;
      scheduler: {
        enabled: boolean;
        totalJobs: number;
        runningJobs: number;
      };
      webhooks: {
        enabled: boolean;
      };
    };
    uptime: number;
  } {
    const clients = this.clientManager.getAllClients();
    const schedulerStatus = this.schedulerService.getStatus();

    return {
      status: this.initialized ? 'healthy' : 'unhealthy',
      services: {
        clients: clients.size,
        scheduler: {
          enabled: this.config.scheduler.enabled,
          totalJobs: schedulerStatus.totalJobs,
          runningJobs: schedulerStatus.runningJobs
        },
        webhooks: {
          enabled: this.config.webhooks.enabled
        }
      },
      uptime: process.uptime()
    };
  }

  // Get detailed statistics
  async getStatistics(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalRecords: {
      customers: number;
      products: number;
      orders: number;
    };
    syncJobs: ReturnType<ShopifySchedulerService['getStatus']>;
    webhookStats: Awaited<ReturnType<ShopifyWebhookService['getWebhookStats']>>;
  }> {
    try {
      const [totalTenants, activeTenants, customers, products, orders] = await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { isActive: true, shopDomain: { not: null } } }),
        this.prisma.customer.count(),
        this.prisma.product.count(),
        this.prisma.order.count()
      ]);

      const syncJobs = this.schedulerService.getStatus();
      const webhookStats = await this.webhookService.getWebhookStats();

      return {
        totalTenants,
        activeTenants,
        totalRecords: { customers, products, orders },
        syncJobs,
        webhookStats
      };

    } catch (error) {
      logger.error('Error getting statistics', { error: error.message });
      throw error;
    }
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Shopify Ingestion Service...');

      if (this.config.scheduler.enabled) {
        await this.schedulerService.stopScheduler();
      }

      logger.info('Shopify Ingestion Service shutdown completed');
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      throw error;
    }
  }

  // Express middleware for authentication and tenant context
  createAuthMiddleware() {
    return async (req: Request, res: Response, next: Function) => {
      try {
        const apiKey = req.headers['x-api-key'] as string;
        
        if (!apiKey) {
          return res.status(401).json({ error: 'API key required' });
        }

        const tenant = await this.prisma.tenant.findUnique({
          where: { apiKey }
        });

        if (!tenant) {
          return res.status(401).json({ error: 'Invalid API key' });
        }

        // Add tenant to request context
        (req as any).tenant = tenant;
        next();

      } catch (error) {
        logger.error('Authentication error', { error: error.message });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
}

// Factory function to create the ingestion service
export function createIngestionService(
  prisma: PrismaClient,
  config: IngestionServiceConfig = getDefaultConfig()
): ShopifyIngestionService {
  return new ShopifyIngestionService(prisma, config);
}

// Default configuration
function getDefaultConfig(): IngestionServiceConfig {
  return {
    scheduler: {
      enabled: true
    },
    webhooks: {
      enabled: true,
      endpoint: '/api/webhooks/shopify'
    },
    import: {
      defaultOptions: {
        batchSize: 100,
        concurrency: 2,
        skipExisting: false,
        retryOptions: {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000
        }
      }
    }
  };
}

// Export everything needed for external use
export {
  ShopifyClient,
  ShopifyClientManager,
  ShopifyImportService,
  ShopifyWebhookService,
  ShopifySchedulerService,
  ImportResult,
  ImportOptions,
  ScheduledJob,
  SyncJobConfig
};
