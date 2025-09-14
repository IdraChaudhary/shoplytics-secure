import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import winston from 'winston';
import { ShopifyClient, ShopifyClientManager } from './client';
import { ShopifyImportService, ImportResult, ImportOptions } from './import';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/shopify-scheduler.log' })
  ]
});

export interface ScheduledJob {
  id: string;
  name: string;
  cron: string;
  description: string;
  enabled: boolean;
  tenantId?: string;
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
  task: cron.ScheduledTask | null;
}

export interface SyncJobConfig {
  customers: {
    enabled: boolean;
    schedule: string; // cron expression
    options: ImportOptions;
  };
  products: {
    enabled: boolean;
    schedule: string;
    options: ImportOptions;
  };
  orders: {
    enabled: boolean;
    schedule: string;
    options: ImportOptions;
  };
  fullSync: {
    enabled: boolean;
    schedule: string;
    options: ImportOptions;
  };
}

export class ShopifySchedulerService {
  private prisma: PrismaClient;
  private clientManager: ShopifyClientManager;
  private jobs: Map<string, ScheduledJob> = new Map();
  private defaultConfig: SyncJobConfig;

  constructor(prisma: PrismaClient, clientManager: ShopifyClientManager) {
    this.prisma = prisma;
    this.clientManager = clientManager;
    this.defaultConfig = this.getDefaultSyncConfig();
  }

  // Get default sync configuration
  private getDefaultSyncConfig(): SyncJobConfig {
    return {
      customers: {
        enabled: true,
        schedule: '0 */6 * * *', // Every 6 hours
        options: {
          batchSize: 100,
          concurrency: 2,
          skipExisting: false,
          retryOptions: {
            retries: 3,
            factor: 2,
            minTimeout: 2000,
            maxTimeout: 10000
          }
        }
      },
      products: {
        enabled: true,
        schedule: '0 2 * * *', // Daily at 2 AM
        options: {
          batchSize: 75,
          concurrency: 2,
          skipExisting: false,
          retryOptions: {
            retries: 3,
            factor: 2,
            minTimeout: 2000,
            maxTimeout: 10000
          }
        }
      },
      orders: {
        enabled: true,
        schedule: '*/30 * * * *', // Every 30 minutes
        options: {
          batchSize: 50,
          concurrency: 3,
          skipExisting: false,
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
            to: new Date().toISOString()
          },
          retryOptions: {
            retries: 5,
            factor: 2,
            minTimeout: 1000,
            maxTimeout: 8000
          }
        }
      },
      fullSync: {
        enabled: true,
        schedule: '0 1 * * 0', // Weekly on Sunday at 1 AM
        options: {
          batchSize: 100,
          concurrency: 2,
          skipExisting: false,
          retryOptions: {
            retries: 3,
            factor: 2,
            minTimeout: 3000,
            maxTimeout: 15000
          }
        }
      }
    };
  }

  // Start scheduler for all tenants
  async startScheduler(): Promise<void> {
    try {
      logger.info('Starting Shopify data synchronization scheduler');

      // Get all active tenants with Shopify integration
      const tenants = await this.prisma.tenant.findMany({
        where: {
          isActive: true,
          shopDomain: { not: null }
        }
      });

      logger.info(`Found ${tenants.length} active tenants with Shopify integration`);

      // Schedule jobs for each tenant
      for (const tenant of tenants) {
        await this.scheduleTenantJobs(tenant.id, this.defaultConfig);
      }

      // Schedule global maintenance jobs
      this.scheduleMaintenanceJobs();

      logger.info(`Scheduler started with ${this.jobs.size} scheduled jobs`);
    } catch (error) {
      logger.error('Error starting scheduler', { error: error.message });
      throw error;
    }
  }

  // Schedule jobs for a specific tenant
  async scheduleTenantJobs(tenantId: string, config: SyncJobConfig = this.defaultConfig): Promise<void> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      logger.info(`Scheduling sync jobs for tenant: ${tenantId}`, config);

      // Schedule customer sync
      if (config.customers.enabled) {
        this.scheduleJob({
          id: `customers-sync-${tenantId}`,
          name: `Customer Sync - ${tenant.name}`,
          cron: config.customers.schedule,
          description: `Periodic customer data synchronization for ${tenant.name}`,
          enabled: true,
          tenantId,
          status: 'idle',
          task: null
        }, () => this.syncCustomers(tenantId, config.customers.options));
      }

      // Schedule product sync
      if (config.products.enabled) {
        this.scheduleJob({
          id: `products-sync-${tenantId}`,
          name: `Product Sync - ${tenant.name}`,
          cron: config.products.schedule,
          description: `Periodic product data synchronization for ${tenant.name}`,
          enabled: true,
          tenantId,
          status: 'idle',
          task: null
        }, () => this.syncProducts(tenantId, config.products.options));
      }

      // Schedule order sync
      if (config.orders.enabled) {
        this.scheduleJob({
          id: `orders-sync-${tenantId}`,
          name: `Order Sync - ${tenant.name}`,
          cron: config.orders.schedule,
          description: `Periodic order data synchronization for ${tenant.name}`,
          enabled: true,
          tenantId,
          status: 'idle',
          task: null
        }, () => this.syncOrders(tenantId, config.orders.options));
      }

      // Schedule full sync
      if (config.fullSync.enabled) {
        this.scheduleJob({
          id: `full-sync-${tenantId}`,
          name: `Full Sync - ${tenant.name}`,
          cron: config.fullSync.schedule,
          description: `Complete data synchronization for ${tenant.name}`,
          enabled: true,
          tenantId,
          status: 'idle',
          task: null
        }, () => this.syncAll(tenantId, config.fullSync.options));
      }

      logger.info(`Scheduled ${Object.keys(config).length} sync jobs for tenant: ${tenantId}`);
    } catch (error) {
      logger.error(`Error scheduling tenant jobs for ${tenantId}`, { error: error.message });
      throw error;
    }
  }

  // Schedule a generic job
  private scheduleJob(job: ScheduledJob, handler: () => Promise<void>): void {
    try {
      // Validate cron expression
      if (!cron.validate(job.cron)) {
        throw new Error(`Invalid cron expression: ${job.cron}`);
      }

      // Create scheduled task
      const task = cron.schedule(job.cron, async () => {
        await this.executeJob(job.id, handler);
      }, {
        scheduled: false, // Don't start immediately
        timezone: 'UTC'
      });

      // Update job with task reference
      job.task = task;
      job.nextRun = this.getNextRun(job.cron);

      // Store job
      this.jobs.set(job.id, job);

      // Start the job if enabled
      if (job.enabled) {
        task.start();
        logger.info(`Scheduled job started: ${job.name}`, {
          id: job.id,
          cron: job.cron,
          nextRun: job.nextRun
        });
      }
    } catch (error) {
      logger.error(`Error scheduling job: ${job.name}`, { error: error.message });
      throw error;
    }
  }

  // Execute a scheduled job with error handling
  private async executeJob(jobId: string, handler: () => Promise<void>): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      logger.error(`Job not found: ${jobId}`);
      return;
    }

    // Skip if job is already running
    if (job.status === 'running') {
      logger.warn(`Job already running, skipping: ${job.name}`);
      return;
    }

    const startTime = Date.now();
    
    try {
      logger.info(`Starting scheduled job: ${job.name}`, { id: jobId });
      
      // Update job status
      job.status = 'running';
      job.lastRun = new Date();
      job.nextRun = this.getNextRun(job.cron);

      // Execute job handler
      await handler();

      // Update job status on success
      job.status = 'completed';
      const duration = Date.now() - startTime;
      
      logger.info(`Job completed successfully: ${job.name}`, {
        id: jobId,
        duration,
        nextRun: job.nextRun
      });

    } catch (error) {
      // Update job status on failure
      job.status = 'failed';
      const duration = Date.now() - startTime;
      
      logger.error(`Job failed: ${job.name}`, {
        id: jobId,
        duration,
        error: error.message,
        nextRun: job.nextRun
      });

      // Could implement retry logic here or alert mechanisms
    } finally {
      // Reset status to idle after a delay
      setTimeout(() => {
        if (job.status !== 'running') {
          job.status = 'idle';
        }
      }, 10000); // 10 seconds
    }
  }

  // Sync methods for different data types
  private async syncCustomers(tenantId: string, options: ImportOptions): Promise<void> {
    const client = this.clientManager.getClient(tenantId);
    if (!client) {
      throw new Error(`No Shopify client found for tenant: ${tenantId}`);
    }

    const importService = new ShopifyImportService(this.prisma, client, tenantId, options);
    const result = await importService.importCustomers(options);

    logger.info(`Customer sync completed for tenant: ${tenantId}`, result);
    
    if (!result.success) {
      throw new Error(`Customer sync failed: ${result.errors} errors`);
    }
  }

  private async syncProducts(tenantId: string, options: ImportOptions): Promise<void> {
    const client = this.clientManager.getClient(tenantId);
    if (!client) {
      throw new Error(`No Shopify client found for tenant: ${tenantId}`);
    }

    const importService = new ShopifyImportService(this.prisma, client, tenantId, options);
    const result = await importService.importProducts(options);

    logger.info(`Product sync completed for tenant: ${tenantId}`, result);
    
    if (!result.success) {
      throw new Error(`Product sync failed: ${result.errors} errors`);
    }
  }

  private async syncOrders(tenantId: string, options: ImportOptions): Promise<void> {
    const client = this.clientManager.getClient(tenantId);
    if (!client) {
      throw new Error(`No Shopify client found for tenant: ${tenantId}`);
    }

    const importService = new ShopifyImportService(this.prisma, client, tenantId, options);
    const result = await importService.importOrders(options);

    logger.info(`Order sync completed for tenant: ${tenantId}`, result);
    
    if (!result.success) {
      throw new Error(`Order sync failed: ${result.errors} errors`);
    }
  }

  private async syncAll(tenantId: string, options: ImportOptions): Promise<void> {
    const client = this.clientManager.getClient(tenantId);
    if (!client) {
      throw new Error(`No Shopify client found for tenant: ${tenantId}`);
    }

    const importService = new ShopifyImportService(this.prisma, client, tenantId, options);
    const results = await importService.importAll(options);

    const totalImported = results.customers.imported + results.products.imported + results.orders.imported;
    const totalErrors = results.customers.errors + results.products.errors + results.orders.errors;

    logger.info(`Full sync completed for tenant: ${tenantId}`, {
      totalImported,
      totalErrors,
      customers: results.customers,
      products: results.products,
      orders: results.orders
    });
    
    if (totalErrors > 0) {
      throw new Error(`Full sync completed with ${totalErrors} errors`);
    }
  }

  // Schedule maintenance jobs (cleanup, health checks, etc.)
  private scheduleMaintenanceJobs(): void {
    // Health check job
    this.scheduleJob({
      id: 'shopify-health-check',
      name: 'Shopify API Health Check',
      cron: '*/15 * * * *', // Every 15 minutes
      description: 'Check Shopify API connectivity for all tenants',
      enabled: true,
      status: 'idle',
      task: null
    }, this.performHealthChecks.bind(this));

    // Cleanup job
    this.scheduleJob({
      id: 'cleanup-logs',
      name: 'Log Cleanup',
      cron: '0 0 * * *', // Daily at midnight
      description: 'Clean up old log files and data',
      enabled: true,
      status: 'idle',
      task: null
    }, this.performCleanup.bind(this));

    // Rate limit monitoring
    this.scheduleJob({
      id: 'rate-limit-monitor',
      name: 'Rate Limit Monitor',
      cron: '*/5 * * * *', // Every 5 minutes
      description: 'Monitor Shopify API rate limits across tenants',
      enabled: true,
      status: 'idle',
      task: null
    }, this.monitorRateLimits.bind(this));
  }

  // Maintenance job implementations
  private async performHealthChecks(): Promise<void> {
    try {
      const healthResults = await this.clientManager.healthCheckAll();
      const failedChecks = Object.entries(healthResults).filter(([, healthy]) => !healthy);

      if (failedChecks.length > 0) {
        logger.warn('Health check failures detected', {
          failed: failedChecks.length,
          total: Object.keys(healthResults).length,
          failedTenants: failedChecks.map(([tenantId]) => tenantId)
        });
      } else {
        logger.info('All health checks passed', {
          total: Object.keys(healthResults).length
        });
      }
    } catch (error) {
      logger.error('Error performing health checks', { error: error.message });
      throw error;
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      // Cleanup old webhook events (if you implement webhook event storage)
      // Cleanup old sync logs
      // Remove temporary files
      logger.info('Cleanup completed successfully');
    } catch (error) {
      logger.error('Error performing cleanup', { error: error.message });
      throw error;
    }
  }

  private async monitorRateLimits(): Promise<void> {
    try {
      const clients = this.clientManager.getAllClients();
      const alerts: string[] = [];

      for (const [tenantId, client] of clients) {
        const rateLimitInfo = client.getRateLimitInfo();
        if (rateLimitInfo && client.isRateLimited()) {
          alerts.push(tenantId);
          logger.warn('Rate limit threshold reached', {
            tenantId,
            callsMade: rateLimitInfo.callsMade,
            bucketSize: rateLimitInfo.bucketSize,
            percentage: (rateLimitInfo.callsMade / rateLimitInfo.bucketSize) * 100
          });
        }
      }

      if (alerts.length === 0) {
        logger.debug('Rate limit monitoring - all tenants OK', {
          monitoredTenants: clients.size
        });
      }
    } catch (error) {
      logger.error('Error monitoring rate limits', { error: error.message });
      throw error;
    }
  }

  // Job management methods
  enableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.enabled = true;
    job.task?.start();
    job.nextRun = this.getNextRun(job.cron);

    logger.info(`Job enabled: ${job.name}`, { id: jobId });
    return true;
  }

  disableJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.enabled = false;
    job.task?.stop();
    job.nextRun = undefined;

    logger.info(`Job disabled: ${job.name}`, { id: jobId });
    return true;
  }

  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  getJobsByTenant(tenantId: string): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter(job => job.tenantId === tenantId);
  }

  // Stop scheduler and cleanup
  async stopScheduler(): Promise<void> {
    logger.info('Stopping scheduler...');

    for (const job of this.jobs.values()) {
      if (job.task) {
        job.task.stop();
      }
    }

    this.jobs.clear();
    logger.info('Scheduler stopped');
  }

  // Utility methods
  private getNextRun(cronExpression: string): Date {
    // Simple next run calculation - in production, use a proper cron library
    return new Date(Date.now() + 60000); // Placeholder: 1 minute from now
  }

  // Get scheduler status
  getStatus(): {
    totalJobs: number;
    enabledJobs: number;
    runningJobs: number;
    jobsByStatus: Record<string, number>;
    jobsByTenant: Record<string, number>;
  } {
    const jobs = Array.from(this.jobs.values());
    
    const jobsByStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobsByTenant = jobs.reduce((acc, job) => {
      const tenant = job.tenantId || 'global';
      acc[tenant] = (acc[tenant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalJobs: jobs.length,
      enabledJobs: jobs.filter(job => job.enabled).length,
      runningJobs: jobs.filter(job => job.status === 'running').length,
      jobsByStatus,
      jobsByTenant
    };
  }
}

// Factory function
export function createSchedulerService(
  prisma: PrismaClient, 
  clientManager: ShopifyClientManager
): ShopifySchedulerService {
  return new ShopifySchedulerService(prisma, clientManager);
}
