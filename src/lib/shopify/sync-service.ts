import { getDb } from '@/lib/database/connection';
import { 
  tenants,
  dashboardOrders, 
  dashboardCustomers, 
  dashboardProducts,
  webhookLogs 
} from '@/lib/database/schemas/tenants';
import { eq } from 'drizzle-orm';
import { createShopifyClient, ShopifyClient } from './client';
import { ShopifyOrder, ShopifyCustomer, ShopifyProduct } from '@/types/dashboard';
import cron from 'node-cron';

export interface SyncOptions {
  tenantId: number;
  fullSync?: boolean;
  syncOrders?: boolean;
  syncCustomers?: boolean;
  syncProducts?: boolean;
  batchSize?: number;
  maxRetries?: number;
}

export interface SyncResult {
  success: boolean;
  tenantId: number;
  timestamp: Date;
  stats: {
    ordersProcessed: number;
    customersProcessed: number;
    productsProcessed: number;
    errors: number;
  };
  errors?: any[];
  duration: number;
}

export class ShopifyDataSyncService {
  private clients: Map<number, ShopifyClient> = new Map();
  private syncInProgress: Set<number> = new Set();

  constructor() {
    this.initializeClients();
    this.setupCronJobs();
  }

  private async initializeClients() {
    try {
      const db = getDb();
      const activeTenants = await db
        .select()
        .from(tenants)
        .where(eq(tenants.isActive, true));

      for (const tenant of activeTenants) {
        if (tenant.shopifyAccessToken && tenant.shopifyStoreUrl) {
          const client = createShopifyClient({
            storeUrl: tenant.shopifyStoreUrl,
            accessToken: tenant.shopifyAccessToken,
          });
          
          this.clients.set(tenant.id, client);
        }
      }

      console.log(`Initialized ${this.clients.size} Shopify clients`);
    } catch (error) {
      console.error('Failed to initialize Shopify clients:', error);
    }
  }

  private setupCronJobs() {
    // Run sync every hour for all active tenants
    cron.schedule('0 * * * *', async () => {
      console.log('Starting scheduled sync for all tenants');
      await this.syncAllTenants();
    });

    // Run full sync daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Starting daily full sync for all tenants');
      await this.syncAllTenants({ fullSync: true });
    });
  }

  async syncAllTenants(options: Omit<SyncOptions, 'tenantId'> = {}): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    
    for (const [tenantId] of this.clients) {
      try {
        const result = await this.syncTenant({ ...options, tenantId });
        results.push(result);
      } catch (error) {
        console.error(`Failed to sync tenant ${tenantId}:`, error);
        results.push({
          success: false,
          tenantId,
          timestamp: new Date(),
          stats: { ordersProcessed: 0, customersProcessed: 0, productsProcessed: 0, errors: 1 },
          errors: [error],
          duration: 0,
        });
      }
    }

    return results;
  }

  async syncTenant(options: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now();
    const { tenantId } = options;
    
    // Prevent concurrent syncs for the same tenant
    if (this.syncInProgress.has(tenantId)) {
      throw new Error(`Sync already in progress for tenant ${tenantId}`);
    }

    this.syncInProgress.add(tenantId);
    
    const result: SyncResult = {
      success: false,
      tenantId,
      timestamp: new Date(),
      stats: {
        ordersProcessed: 0,
        customersProcessed: 0,
        productsProcessed: 0,
        errors: 0,
      },
      errors: [],
      duration: 0,
    };

    try {
      const client = this.clients.get(tenantId);
      if (!client) {
        throw new Error(`No Shopify client found for tenant ${tenantId}`);
      }

      // Health check
      const isHealthy = await client.healthCheck();
      if (!isHealthy) {
        throw new Error('Shopify API health check failed');
      }

      // Sync orders
      if (options.syncOrders !== false) {
        try {
          const ordersResult = await this.syncOrders(client, tenantId, options);
          result.stats.ordersProcessed = ordersResult.processed;
        } catch (error) {
          result.stats.errors++;
          result.errors?.push({ type: 'orders', error });
        }
      }

      // Sync customers
      if (options.syncCustomers !== false) {
        try {
          const customersResult = await this.syncCustomers(client, tenantId, options);
          result.stats.customersProcessed = customersResult.processed;
        } catch (error) {
          result.stats.errors++;
          result.errors?.push({ type: 'customers', error });
        }
      }

      // Sync products
      if (options.syncProducts !== false) {
        try {
          const productsResult = await this.syncProducts(client, tenantId, options);
          result.stats.productsProcessed = productsResult.processed;
        } catch (error) {
          result.stats.errors++;
          result.errors?.push({ type: 'products', error });
        }
      }

      result.success = result.stats.errors === 0;
    } catch (error) {
      result.stats.errors++;
      result.errors?.push({ type: 'general', error });
    } finally {
      this.syncInProgress.delete(tenantId);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  private async syncOrders(
    client: ShopifyClient, 
    tenantId: number, 
    options: SyncOptions
  ): Promise<{ processed: number }> {
    let processed = 0;
    const batchSize = options.batchSize || 250;
    const db = getDb();
    
    // Determine the date range for incremental sync
    let updatedAtMin: string | undefined;
    
    if (!options.fullSync) {
      // Get the most recent order update timestamp
      const lastOrder = await db
        .select({ shopifyUpdatedAt: dashboardOrders.shopifyUpdatedAt })
        .from(dashboardOrders)
        .where(eq(dashboardOrders.tenantId, tenantId))
        .orderBy(dashboardOrders.shopifyUpdatedAt)
        .limit(1);
      
      if (lastOrder.length > 0 && lastOrder[0].shopifyUpdatedAt) {
        updatedAtMin = lastOrder[0].shopifyUpdatedAt.toISOString();
      }
    }

    const { items: orders } = await client.batchImport<ShopifyOrder>(
      async (cursor) => {
        const response = await client.getOrders({
          limit: batchSize,
          sinceId: cursor,
          updatedAtMin,
          status: 'any',
        });
        
        return {
          ...response,
          data: response.data?.orders || [],
        };
      },
      async (ordersBatch) => {
        await this.processOrdersBatch(ordersBatch, tenantId);
        processed += ordersBatch.length;
      }
    );

    return { processed };
  }

  private async processOrdersBatch(orders: ShopifyOrder[], tenantId: number) {
    for (const order of orders) {
      try {
        await this.upsertOrder(order, tenantId);
      } catch (error) {
        console.error(`Failed to process order ${order.id}:`, error);
      }
    }
  }

  private async upsertOrder(order: ShopifyOrder, tenantId: number) {
    const db = getDb();
    // First, handle the customer if present
    let customerId: number | null = null;
    
    if (order.customer) {
      customerId = await this.upsertCustomer(order.customer, tenantId);
    }

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(dashboardOrders)
      .where(eq(dashboardOrders.shopifyOrderId, order.id.toString()))
      .limit(1);

    const orderData = {
      tenantId,
      shopifyOrderId: order.id.toString(),
      customerId,
      orderNumber: order.order_number,
      email: order.email,
      totalPrice: order.total_price,
      subtotalPrice: order.subtotal_price,
      totalTax: order.total_tax,
      totalDiscounts: order.total_discounts,
      currency: order.currency,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      orderDate: new Date(order.created_at),
      processedAt: order.processed_at ? new Date(order.processed_at) : null,
      lineItems: order.line_items,
      billingAddress: order.billing_address,
      shippingAddress: order.shipping_address,
      discountCodes: order.discount_codes,
      shopifyCreatedAt: new Date(order.created_at),
      shopifyUpdatedAt: new Date(order.updated_at),
      updatedAt: new Date(),
    };

    if (existingOrder.length > 0) {
      await db
        .update(dashboardOrders)
        .set(orderData)
        .where(eq(dashboardOrders.id, existingOrder[0].id));
    } else {
      await db.insert(dashboardOrders).values(orderData);
    }
  }

  private async syncCustomers(
    client: ShopifyClient, 
    tenantId: number, 
    options: SyncOptions
  ): Promise<{ processed: number }> {
    let processed = 0;
    const batchSize = options.batchSize || 250;
    const db = getDb();
    
    let updatedAtMin: string | undefined;
    
    if (!options.fullSync) {
      const lastCustomer = await db
        .select({ shopifyUpdatedAt: dashboardCustomers.shopifyUpdatedAt })
        .from(dashboardCustomers)
        .where(eq(dashboardCustomers.tenantId, tenantId))
        .orderBy(dashboardCustomers.shopifyUpdatedAt)
        .limit(1);
      
      if (lastCustomer.length > 0 && lastCustomer[0].shopifyUpdatedAt) {
        updatedAtMin = lastCustomer[0].shopifyUpdatedAt.toISOString();
      }
    }

    await client.batchImport<ShopifyCustomer>(
      async (cursor) => {
        const response = await client.getCustomers({
          limit: batchSize,
          sinceId: cursor,
          updatedAtMin,
        });
        
        return {
          ...response,
          data: response.data?.customers || [],
        };
      },
      async (customersBatch) => {
        for (const customer of customersBatch) {
          try {
            await this.upsertCustomer(customer, tenantId);
            processed++;
          } catch (error) {
            console.error(`Failed to process customer ${customer.id}:`, error);
          }
        }
      }
    );

    return { processed };
  }

  private async upsertCustomer(customer: ShopifyCustomer, tenantId: number): Promise<number> {
    const db = getDb();
    const existingCustomer = await db
      .select()
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.shopifyCustomerId, customer.id.toString()))
      .limit(1);

    const customerData = {
      tenantId,
      shopifyCustomerId: customer.id.toString(),
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      totalSpent: customer.total_spent,
      ordersCount: customer.orders_count,
      state: customer.state,
      acceptsMarketing: customer.accepts_marketing,
      tags: customer.tags,
      shopifyCreatedAt: new Date(customer.created_at),
      shopifyUpdatedAt: new Date(customer.updated_at),
      updatedAt: new Date(),
    };

    if (existingCustomer.length > 0) {
      await db
        .update(dashboardCustomers)
        .set(customerData)
        .where(eq(dashboardCustomers.id, existingCustomer[0].id));
      return existingCustomer[0].id;
    } else {
      const [newCustomer] = await db
        .insert(dashboardCustomers)
        .values(customerData)
        .returning();
      return newCustomer.id;
    }
  }

  private async syncProducts(
    client: ShopifyClient, 
    tenantId: number, 
    options: SyncOptions
  ): Promise<{ processed: number }> {
    let processed = 0;
    const batchSize = options.batchSize || 250;
    const db = getDb();
    
    let updatedAtMin: string | undefined;
    
    if (!options.fullSync) {
      const lastProduct = await db
        .select({ shopifyUpdatedAt: dashboardProducts.shopifyUpdatedAt })
        .from(dashboardProducts)
        .where(eq(dashboardProducts.tenantId, tenantId))
        .orderBy(dashboardProducts.shopifyUpdatedAt)
        .limit(1);
      
      if (lastProduct.length > 0 && lastProduct[0].shopifyUpdatedAt) {
        updatedAtMin = lastProduct[0].shopifyUpdatedAt.toISOString();
      }
    }

    await client.batchImport<ShopifyProduct>(
      async (cursor) => {
        const response = await client.getProducts({
          limit: batchSize,
          sinceId: cursor,
          updatedAtMin,
          status: 'active',
        });
        
        return {
          ...response,
          data: response.data?.products || [],
        };
      },
      async (productsBatch) => {
        for (const product of productsBatch) {
          try {
            await this.upsertProduct(product, tenantId);
            processed++;
          } catch (error) {
            console.error(`Failed to process product ${product.id}:`, error);
          }
        }
      }
    );

    return { processed };
  }

  private async upsertProduct(product: ShopifyProduct, tenantId: number) {
    const db = getDb();
    const existingProduct = await db
      .select()
      .from(dashboardProducts)
      .where(eq(dashboardProducts.shopifyProductId, product.id.toString()))
      .limit(1);

    const productData = {
      tenantId,
      shopifyProductId: product.id.toString(),
      title: product.title,
      handle: product.handle,
      vendor: product.vendor,
      productType: product.product_type,
      status: product.status,
      tags: product.tags,
      variants: product.variants,
      images: product.images,
      shopifyCreatedAt: new Date(product.created_at),
      shopifyUpdatedAt: new Date(product.updated_at),
      updatedAt: new Date(),
    };

    if (existingProduct.length > 0) {
      await db
        .update(dashboardProducts)
        .set(productData)
        .where(eq(dashboardProducts.id, existingProduct[0].id));
    } else {
      await db.insert(dashboardProducts).values(productData);
    }
  }

  // Manual sync trigger
  async triggerSync(tenantId: number, options: Omit<SyncOptions, 'tenantId'> = {}): Promise<SyncResult> {
    return this.syncTenant({ ...options, tenantId });
  }

  // Get sync status
  isSyncInProgress(tenantId: number): boolean {
    return this.syncInProgress.has(tenantId);
  }

  // Add new tenant client
  async addTenantClient(tenantId: number) {
    const db = getDb();
    try {
      const tenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId))
        .limit(1);

      if (tenant.length > 0 && tenant[0].shopifyAccessToken && tenant[0].shopifyStoreUrl) {
        const client = createShopifyClient({
          storeUrl: tenant[0].shopifyStoreUrl,
          accessToken: tenant[0].shopifyAccessToken,
        });
        
        this.clients.set(tenantId, client);
        console.log(`Added Shopify client for tenant ${tenantId}`);
      }
    } catch (error) {
      console.error(`Failed to add client for tenant ${tenantId}:`, error);
    }
  }

  // Remove tenant client
  removeTenantClient(tenantId: number) {
    this.clients.delete(tenantId);
    console.log(`Removed Shopify client for tenant ${tenantId}`);
  }
}

// Singleton instance
let syncServiceInstance: ShopifyDataSyncService | null = null;

export function getShopifyDataSyncService(): ShopifyDataSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new ShopifyDataSyncService();
  }
  return syncServiceInstance;
}