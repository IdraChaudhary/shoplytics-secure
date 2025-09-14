import { PrismaClient } from '@prisma/client';
import pLimit from 'p-limit';
import pRetry from 'p-retry';
import winston from 'winston';
import { ShopifyClient } from './client';
import { ShopifyTransformer, ShopifyCustomer, ShopifyProduct, ShopifyOrder } from './transformers';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/shopify-import.log' })
  ]
});

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: number;
  duration: number;
  errorDetails: Array<{
    item: string;
    error: string;
  }>;
}

export interface ImportOptions {
  batchSize?: number;
  concurrency?: number;
  retryOptions?: {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
  };
  skipExisting?: boolean;
  dryRun?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export class ShopifyImportService {
  private prisma: PrismaClient;
  private shopifyClient: ShopifyClient;
  private tenantId: string;
  private limit: any;

  constructor(
    prisma: PrismaClient,
    shopifyClient: ShopifyClient,
    tenantId: string,
    options: ImportOptions = {}
  ) {
    this.prisma = prisma;
    this.shopifyClient = shopifyClient;
    this.tenantId = tenantId;
    this.limit = pLimit(options.concurrency || 3);
  }

  // Import customers with batch processing
  async importCustomers(options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: 0,
      duration: 0,
      errorDetails: []
    };

    try {
      logger.info(`Starting customer import for tenant: ${this.tenantId}`, options);

      const fetchParams: any = {
        limit: 250,
        ...(options.dateRange && {
          created_at_min: options.dateRange.from,
          created_at_max: options.dateRange.to
        })
      };

      // Fetch all customers with pagination
      const allCustomers = await this.shopifyClient.fetchAllPages<ShopifyCustomer>(
        '/customers.json',
        fetchParams,
        async (customers: ShopifyCustomer[]) => {
          if (options.dryRun) {
            logger.info(`[DRY RUN] Would process ${customers.length} customers`);
            return;
          }

          // Process customers in batches
          const batches = this.createBatches(customers, options.batchSize || 50);
          
          for (const batch of batches) {
            try {
              const importResults = await Promise.all(
                batch.map(customer => 
                  this.limit(() => this.importSingleCustomer(customer, options))
                )
              );

              // Aggregate results
              importResults.forEach(res => {
                if (res.success) {
                  if (res.action === 'imported') result.imported++;
                  else if (res.action === 'skipped') result.skipped++;
                } else {
                  result.errors++;
                  result.errorDetails.push({
                    item: `Customer ${customer.id}`,
                    error: res.error || 'Unknown error'
                  });
                }
              });

              logger.info(`Processed customer batch: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);

              // Respect rate limits
              if (this.shopifyClient.isRateLimited()) {
                const waitTime = this.shopifyClient.getWaitTime();
                logger.warn(`Rate limited, waiting ${waitTime}ms`);
                await this.sleep(waitTime);
              }

            } catch (error) {
              logger.error('Error processing customer batch', { error: error.message });
              result.errors += batch.length;
              batch.forEach(customer => {
                result.errorDetails.push({
                  item: `Customer ${customer.id}`,
                  error: error.message
                });
              });
            }
          }
        }
      );

      result.duration = Date.now() - startTime;
      logger.info(`Customer import completed`, result);

      if (result.errors > 0) {
        result.success = false;
      }

      return result;

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      logger.error('Customer import failed', { error: error.message });
      throw error;
    }
  }

  // Import products with batch processing
  async importProducts(options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: 0,
      duration: 0,
      errorDetails: []
    };

    try {
      logger.info(`Starting product import for tenant: ${this.tenantId}`, options);

      const fetchParams: any = {
        limit: 250,
        status: 'active',
        ...(options.dateRange && {
          created_at_min: options.dateRange.from,
          created_at_max: options.dateRange.to
        })
      };

      // Fetch all products with pagination
      await this.shopifyClient.fetchAllPages<ShopifyProduct>(
        '/products.json',
        fetchParams,
        async (products: ShopifyProduct[]) => {
          if (options.dryRun) {
            logger.info(`[DRY RUN] Would process ${products.length} products`);
            return;
          }

          // Process products in batches
          const batches = this.createBatches(products, options.batchSize || 50);
          
          for (const batch of batches) {
            try {
              const importResults = await Promise.all(
                batch.map(product => 
                  this.limit(() => this.importSingleProduct(product, options))
                )
              );

              // Aggregate results
              importResults.forEach((res, index) => {
                if (res.success) {
                  if (res.action === 'imported') result.imported++;
                  else if (res.action === 'skipped') result.skipped++;
                } else {
                  result.errors++;
                  result.errorDetails.push({
                    item: `Product ${batch[index].id}`,
                    error: res.error || 'Unknown error'
                  });
                }
              });

              logger.info(`Processed product batch: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);

              // Respect rate limits
              if (this.shopifyClient.isRateLimited()) {
                const waitTime = this.shopifyClient.getWaitTime();
                logger.warn(`Rate limited, waiting ${waitTime}ms`);
                await this.sleep(waitTime);
              }

            } catch (error) {
              logger.error('Error processing product batch', { error: error.message });
              result.errors += batch.length;
              batch.forEach(product => {
                result.errorDetails.push({
                  item: `Product ${product.id}`,
                  error: error.message
                });
              });
            }
          }
        }
      );

      result.duration = Date.now() - startTime;
      logger.info(`Product import completed`, result);

      if (result.errors > 0) {
        result.success = false;
      }

      return result;

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      logger.error('Product import failed', { error: error.message });
      throw error;
    }
  }

  // Import orders with batch processing
  async importOrders(options: ImportOptions = {}): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: 0,
      duration: 0,
      errorDetails: []
    };

    try {
      logger.info(`Starting order import for tenant: ${this.tenantId}`, options);

      const fetchParams: any = {
        limit: 250,
        status: 'any',
        ...(options.dateRange && {
          created_at_min: options.dateRange.from,
          created_at_max: options.dateRange.to
        })
      };

      // Fetch all orders with pagination
      await this.shopifyClient.fetchAllPages<ShopifyOrder>(
        '/orders.json',
        fetchParams,
        async (orders: ShopifyOrder[]) => {
          if (options.dryRun) {
            logger.info(`[DRY RUN] Would process ${orders.length} orders`);
            return;
          }

          // Process orders in smaller batches due to complexity
          const batches = this.createBatches(orders, options.batchSize || 25);
          
          for (const batch of batches) {
            try {
              const importResults = await Promise.all(
                batch.map(order => 
                  this.limit(() => this.importSingleOrder(order, options))
                )
              );

              // Aggregate results
              importResults.forEach((res, index) => {
                if (res.success) {
                  if (res.action === 'imported') result.imported++;
                  else if (res.action === 'skipped') result.skipped++;
                } else {
                  result.errors++;
                  result.errorDetails.push({
                    item: `Order ${batch[index].id}`,
                    error: res.error || 'Unknown error'
                  });
                }
              });

              logger.info(`Processed order batch: ${result.imported} imported, ${result.skipped} skipped, ${result.errors} errors`);

              // Respect rate limits
              if (this.shopifyClient.isRateLimited()) {
                const waitTime = this.shopifyClient.getWaitTime();
                logger.warn(`Rate limited, waiting ${waitTime}ms`);
                await this.sleep(waitTime);
              }

            } catch (error) {
              logger.error('Error processing order batch', { error: error.message });
              result.errors += batch.length;
              batch.forEach(order => {
                result.errorDetails.push({
                  item: `Order ${order.id}`,
                  error: error.message
                });
              });
            }
          }
        }
      );

      result.duration = Date.now() - startTime;
      logger.info(`Order import completed`, result);

      if (result.errors > 0) {
        result.success = false;
      }

      return result;

    } catch (error) {
      result.success = false;
      result.duration = Date.now() - startTime;
      logger.error('Order import failed', { error: error.message });
      throw error;
    }
  }

  // Import all data types
  async importAll(options: ImportOptions = {}): Promise<{
    customers: ImportResult;
    products: ImportResult;
    orders: ImportResult;
  }> {
    logger.info(`Starting full data import for tenant: ${this.tenantId}`);

    const results = {
      customers: await this.importCustomers(options),
      products: await this.importProducts(options),
      orders: await this.importOrders(options)
    };

    logger.info('Full data import completed', {
      customers: `${results.customers.imported} imported, ${results.customers.errors} errors`,
      products: `${results.products.imported} imported, ${results.products.errors} errors`,
      orders: `${results.orders.imported} imported, ${results.orders.errors} errors`
    });

    return results;
  }

  // Single customer import with retry logic
  private async importSingleCustomer(customer: ShopifyCustomer, options: ImportOptions): Promise<{
    success: boolean;
    action: 'imported' | 'skipped' | 'updated';
    error?: string;
  }> {
    return pRetry(async () => {
      try {
        // Validate customer data
        if (!ShopifyTransformer.validateCustomerData(customer)) {
          return { success: false, action: 'skipped', error: 'Invalid customer data' };
        }

        // Check if customer exists
        if (options.skipExisting) {
          const existing = await this.prisma.customer.findFirst({
            where: {
              shopifyId: customer.id.toString(),
              tenantId: this.tenantId
            }
          });

          if (existing) {
            return { success: true, action: 'skipped' };
          }
        }

        // Transform and upsert customer
        const transformedCustomer = ShopifyTransformer.transformCustomer(customer, this.tenantId);
        
        await this.prisma.customer.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: customer.id.toString(),
              tenantId: this.tenantId
            }
          },
          update: transformedCustomer,
          create: transformedCustomer
        });

        return { success: true, action: 'imported' };

      } catch (error) {
        logger.error('Error importing customer', { 
          customerId: customer.id, 
          error: error.message 
        });
        throw error;
      }
    }, {
      retries: options.retryOptions?.retries || 3,
      factor: options.retryOptions?.factor || 2,
      minTimeout: options.retryOptions?.minTimeout || 1000,
      maxTimeout: options.retryOptions?.maxTimeout || 5000
    });
  }

  // Single product import with retry logic
  private async importSingleProduct(product: ShopifyProduct, options: ImportOptions): Promise<{
    success: boolean;
    action: 'imported' | 'skipped' | 'updated';
    error?: string;
  }> {
    return pRetry(async () => {
      try {
        // Validate product data
        if (!ShopifyTransformer.validateProductData(product)) {
          return { success: false, action: 'skipped', error: 'Invalid product data' };
        }

        // Check if product exists
        if (options.skipExisting) {
          const existing = await this.prisma.product.findFirst({
            where: {
              shopifyId: product.id.toString(),
              tenantId: this.tenantId
            }
          });

          if (existing) {
            return { success: true, action: 'skipped' };
          }
        }

        // Transform and upsert product
        const transformedProduct = ShopifyTransformer.transformProduct(product, this.tenantId);
        
        await this.prisma.product.upsert({
          where: {
            shopifyId_tenantId: {
              shopifyId: product.id.toString(),
              tenantId: this.tenantId
            }
          },
          update: transformedProduct,
          create: transformedProduct
        });

        return { success: true, action: 'imported' };

      } catch (error) {
        logger.error('Error importing product', { 
          productId: product.id, 
          error: error.message 
        });
        throw error;
      }
    }, {
      retries: options.retryOptions?.retries || 3,
      factor: options.retryOptions?.factor || 2,
      minTimeout: options.retryOptions?.minTimeout || 1000,
      maxTimeout: options.retryOptions?.maxTimeout || 5000
    });
  }

  // Single order import with retry logic
  private async importSingleOrder(order: ShopifyOrder, options: ImportOptions): Promise<{
    success: boolean;
    action: 'imported' | 'skipped' | 'updated';
    error?: string;
  }> {
    return pRetry(async () => {
      try {
        // Validate order data
        if (!ShopifyTransformer.validateOrderData(order)) {
          return { success: false, action: 'skipped', error: 'Invalid order data' };
        }

        // Check if order exists
        if (options.skipExisting) {
          const existing = await this.prisma.order.findFirst({
            where: {
              shopifyId: order.id.toString(),
              tenantId: this.tenantId
            }
          });

          if (existing) {
            return { success: true, action: 'skipped' };
          }
        }

        // Transform order data
        const { orders, lineItems, events } = ShopifyTransformer.transformOrdersBatch([order], this.tenantId);
        const transformedOrder = orders[0];

        // Use transaction for order import
        await this.prisma.$transaction(async (tx) => {
          // Upsert order
          const savedOrder = await tx.order.upsert({
            where: {
              shopifyId_tenantId: {
                shopifyId: order.id.toString(),
                tenantId: this.tenantId
              }
            },
            update: transformedOrder,
            create: transformedOrder
          });

          // Delete existing line items and events for update case
          await tx.orderLineItem.deleteMany({
            where: {
              orderId: savedOrder.shopifyId,
              tenantId: this.tenantId
            }
          });

          await tx.orderEvent.deleteMany({
            where: {
              orderId: savedOrder.shopifyId,
              tenantId: this.tenantId
            }
          });

          // Insert line items
          if (lineItems.length > 0) {
            await tx.orderLineItem.createMany({
              data: lineItems.map(item => ({
                ...item,
                orderId: savedOrder.shopifyId
              }))
            });
          }

          // Insert events
          if (events.length > 0) {
            await tx.orderEvent.createMany({
              data: events.map(event => ({
                ...event,
                orderId: savedOrder.shopifyId
              }))
            });
          }
        });

        return { success: true, action: 'imported' };

      } catch (error) {
        logger.error('Error importing order', { 
          orderId: order.id, 
          error: error.message 
        });
        throw error;
      }
    }, {
      retries: options.retryOptions?.retries || 3,
      factor: options.retryOptions?.factor || 2,
      minTimeout: options.retryOptions?.minTimeout || 1000,
      maxTimeout: options.retryOptions?.maxTimeout || 5000
    });
  }

  // Utility methods
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get import statistics
  async getImportStats(): Promise<{
    customers: number;
    products: number;
    orders: number;
    lastSync?: Date;
  }> {
    const [customers, products, orders] = await Promise.all([
      this.prisma.customer.count({ where: { tenantId: this.tenantId } }),
      this.prisma.product.count({ where: { tenantId: this.tenantId } }),
      this.prisma.order.count({ where: { tenantId: this.tenantId } })
    ]);

    // Get last sync timestamp (if available)
    const lastOrder = await this.prisma.order.findFirst({
      where: { tenantId: this.tenantId },
      orderBy: { shopifyUpdatedAt: 'desc' },
      select: { shopifyUpdatedAt: true }
    });

    return {
      customers,
      products,
      orders,
      lastSync: lastOrder?.shopifyUpdatedAt
    };
  }
}

// Factory function for creating import service instances
export function createImportService(
  prisma: PrismaClient,
  shopifyClient: ShopifyClient,
  tenantId: string,
  options?: ImportOptions
): ShopifyImportService {
  return new ShopifyImportService(prisma, shopifyClient, tenantId, options);
}
