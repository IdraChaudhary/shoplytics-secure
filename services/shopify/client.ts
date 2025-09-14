import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import { RestClient } from '@shopify/shopify-api/rest/admin/2024-01';
import axios, { AxiosInstance } from 'axios';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/shopify-client.log' })
  ]
});

export interface ShopifyCredentials {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyRateLimit {
  callLimit: number;
  callsMade: number;
  bucketSize: number;
  leakRate: number;
  retryAfter?: number;
}

export class ShopifyClient {
  private restClient: RestClient;
  private axiosClient: AxiosInstance;
  private credentials: ShopifyCredentials;
  private rateLimitInfo: ShopifyRateLimit | null = null;

  constructor(credentials: ShopifyCredentials) {
    this.credentials = {
      ...credentials,
      apiVersion: credentials.apiVersion || LATEST_API_VERSION
    };

    // Initialize Shopify REST client
    const shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY || '',
      apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
      scopes: ['read_customers', 'read_products', 'read_orders'],
      hostName: process.env.HOST_NAME || 'localhost',
      apiVersion: this.credentials.apiVersion
    });

    this.restClient = new RestClient({
      session: {
        shop: this.credentials.shopDomain,
        accessToken: this.credentials.accessToken
      }
    });

    // Initialize Axios client for custom requests
    this.axiosClient = axios.create({
      baseURL: `https://${this.credentials.shopDomain}/admin/api/${this.credentials.apiVersion}`,
      headers: {
        'X-Shopify-Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for rate limit tracking
    this.axiosClient.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response.headers);
        return response;
      },
      (error) => {
        if (error.response) {
          this.updateRateLimitInfo(error.response.headers);
        }
        return Promise.reject(error);
      }
    );
  }

  private updateRateLimitInfo(headers: any): void {
    const callLimit = headers['x-shopify-shop-api-call-limit'];
    if (callLimit) {
      const [callsMade, bucketSize] = callLimit.split('/').map(Number);
      this.rateLimitInfo = {
        callLimit: bucketSize,
        callsMade,
        bucketSize,
        leakRate: 2, // Shopify's default leak rate is 2 calls per second
        retryAfter: headers['retry-after'] ? parseInt(headers['retry-after']) : undefined
      };

      logger.info('Rate limit info updated', {
        callsMade,
        bucketSize,
        percentage: (callsMade / bucketSize) * 100
      });
    }
  }

  public getRateLimitInfo(): ShopifyRateLimit | null {
    return this.rateLimitInfo;
  }

  public isRateLimited(): boolean {
    if (!this.rateLimitInfo) return false;
    // Consider rate limited if we're at 80% of bucket capacity
    return (this.rateLimitInfo.callsMade / this.rateLimitInfo.bucketSize) > 0.8;
  }

  public getWaitTime(): number {
    if (!this.rateLimitInfo || !this.isRateLimited()) return 0;
    
    // If retry-after header is present, use it
    if (this.rateLimitInfo.retryAfter) {
      return this.rateLimitInfo.retryAfter * 1000;
    }

    // Calculate wait time based on bucket refill rate
    const callsToWait = this.rateLimitInfo.callsMade - (this.rateLimitInfo.bucketSize * 0.5);
    return Math.max(0, (callsToWait / this.rateLimitInfo.leakRate) * 1000);
  }

  // Customer methods
  async getCustomers(params: {
    limit?: number;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
  } = {}): Promise<any[]> {
    try {
      logger.info('Fetching customers from Shopify', params);
      const response = await this.axiosClient.get('/customers.json', { params });
      logger.info(`Fetched ${response.data.customers.length} customers`);
      return response.data.customers;
    } catch (error) {
      logger.error('Error fetching customers', { error: error.message });
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<any> {
    try {
      const response = await this.axiosClient.get(`/customers/${customerId}.json`);
      return response.data.customer;
    } catch (error) {
      logger.error('Error fetching customer', { customerId, error: error.message });
      throw error;
    }
  }

  // Product methods
  async getProducts(params: {
    limit?: number;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    status?: 'active' | 'archived' | 'draft';
  } = {}): Promise<any[]> {
    try {
      logger.info('Fetching products from Shopify', params);
      const response = await this.axiosClient.get('/products.json', { params });
      logger.info(`Fetched ${response.data.products.length} products`);
      return response.data.products;
    } catch (error) {
      logger.error('Error fetching products', { error: error.message });
      throw error;
    }
  }

  async getProduct(productId: string): Promise<any> {
    try {
      const response = await this.axiosClient.get(`/products/${productId}.json`);
      return response.data.product;
    } catch (error) {
      logger.error('Error fetching product', { productId, error: error.message });
      throw error;
    }
  }

  // Order methods
  async getOrders(params: {
    limit?: number;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
    updated_at_min?: string;
    updated_at_max?: string;
    status?: 'open' | 'closed' | 'cancelled' | 'any';
    financial_status?: string;
    fulfillment_status?: string;
  } = {}): Promise<any[]> {
    try {
      logger.info('Fetching orders from Shopify', params);
      const response = await this.axiosClient.get('/orders.json', { params });
      logger.info(`Fetched ${response.data.orders.length} orders`);
      return response.data.orders;
    } catch (error) {
      logger.error('Error fetching orders', { error: error.message });
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<any> {
    try {
      const response = await this.axiosClient.get(`/orders/${orderId}.json`);
      return response.data.order;
    } catch (error) {
      logger.error('Error fetching order', { orderId, error: error.message });
      throw error;
    }
  }

  // Generic paginated fetch method
  async fetchAllPages<T>(
    endpoint: string,
    params: any = {},
    processor?: (items: T[]) => Promise<void>
  ): Promise<T[]> {
    const allItems: T[] = [];
    let hasNextPage = true;
    let sinceId: string | undefined;

    while (hasNextPage) {
      try {
        // Check rate limit before making request
        if (this.isRateLimited()) {
          const waitTime = this.getWaitTime();
          logger.warn(`Rate limited, waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        }

        const requestParams = { ...params, limit: 250 };
        if (sinceId) {
          requestParams.since_id = sinceId;
        }

        const response = await this.axiosClient.get(endpoint, { params: requestParams });
        const items = Object.values(response.data)[0] as T[];

        if (items && items.length > 0) {
          allItems.push(...items);
          
          // Process batch if processor provided
          if (processor) {
            await processor(items);
          }

          // Set since_id for next page
          sinceId = (items[items.length - 1] as any).id?.toString();
          
          logger.info(`Fetched ${items.length} items, total: ${allItems.length}`);
          
          // Check if we got less than limit (indicates last page)
          hasNextPage = items.length === requestParams.limit;
        } else {
          hasNextPage = false;
        }

        // Small delay between requests to be respectful
        await this.sleep(100);

      } catch (error) {
        logger.error('Error in paginated fetch', { endpoint, error: error.message });
        
        // Handle rate limit errors
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
          logger.warn(`Rate limited (429), waiting ${waitTime}ms`);
          await this.sleep(waitTime);
          continue;
        }

        throw error;
      }
    }

    logger.info(`Completed paginated fetch for ${endpoint}, total items: ${allItems.length}`);
    return allItems;
  }

  // Utility method for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosClient.get('/shop.json');
      return response.status === 200;
    } catch (error) {
      logger.error('Shopify health check failed', { error: error.message });
      return false;
    }
  }

  // Get shop information
  async getShopInfo(): Promise<any> {
    try {
      const response = await this.axiosClient.get('/shop.json');
      return response.data.shop;
    } catch (error) {
      logger.error('Error fetching shop info', { error: error.message });
      throw error;
    }
  }
}

// Factory function to create Shopify client instances
export function createShopifyClient(credentials: ShopifyCredentials): ShopifyClient {
  return new ShopifyClient(credentials);
}

// Multi-store client manager
export class ShopifyClientManager {
  private clients: Map<string, ShopifyClient> = new Map();

  addClient(tenantId: string, credentials: ShopifyCredentials): void {
    const client = new ShopifyClient(credentials);
    this.clients.set(tenantId, client);
    logger.info(`Added Shopify client for tenant: ${tenantId}`);
  }

  getClient(tenantId: string): ShopifyClient | null {
    return this.clients.get(tenantId) || null;
  }

  removeClient(tenantId: string): boolean {
    const removed = this.clients.delete(tenantId);
    if (removed) {
      logger.info(`Removed Shopify client for tenant: ${tenantId}`);
    }
    return removed;
  }

  getAllClients(): Map<string, ShopifyClient> {
    return this.clients;
  }

  async healthCheckAll(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [tenantId, client] of this.clients) {
      try {
        results[tenantId] = await client.healthCheck();
      } catch (error) {
        results[tenantId] = false;
        logger.error(`Health check failed for tenant ${tenantId}`, { error: error.message });
      }
    }

    return results;
  }
}
