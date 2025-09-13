import { ShopifyOrder, ShopifyCustomer, ShopifyProduct } from '@/types/dashboard';

export interface ShopifyClientConfig {
  storeUrl: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyApiResponse<T> {
  data?: T;
  errors?: any[];
  success: boolean;
  rateLimitRemaining?: number;
  rateLimitResetTime?: Date;
}

export interface PaginationInfo {
  hasNext: boolean;
  hasPrevious: boolean;
  cursor?: string;
}

export interface ShopifyPaginatedResponse<T> extends ShopifyApiResponse<T[]> {
  pagination: PaginationInfo;
}

export class ShopifyClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private apiVersion: string;

  constructor(config: ShopifyClientConfig) {
    this.apiVersion = config.apiVersion || '2023-10';
    this.baseUrl = `https://${config.storeUrl}/admin/api/${this.apiVersion}`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.accessToken,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ShopifyApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      const rateLimitRemaining = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
      const resetTime = response.headers.get('X-Shopify-Shop-Api-Call-Limit-Reset-Time');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          errors: errorData.errors || [{ message: response.statusText }],
          rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
          rateLimitResetTime: resetTime ? new Date(resetTime) : undefined,
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
        rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining) : undefined,
        rateLimitResetTime: resetTime ? new Date(resetTime) : undefined,
      };
    } catch (error) {
      console.error('Shopify API request failed:', error);
      return {
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  // Orders API
  async getOrders(params: {
    limit?: number;
    sinceId?: string;
    createdAtMin?: string;
    createdAtMax?: string;
    updatedAtMin?: string;
    updatedAtMax?: string;
    status?: 'open' | 'closed' | 'cancelled' | 'any';
    financialStatus?: 'authorized' | 'paid' | 'pending' | 'partially_paid' | 'partially_refunded' | 'refunded' | 'voided' | 'any';
  } = {}): Promise<ShopifyApiResponse<{ orders: ShopifyOrder[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest<{ orders: ShopifyOrder[] }>(
      `/orders.json?${searchParams.toString()}`
    );
  }

  async getOrder(orderId: string): Promise<ShopifyApiResponse<{ order: ShopifyOrder }>> {
    return this.makeRequest<{ order: ShopifyOrder }>(`/orders/${orderId}.json`);
  }

  // Customers API
  async getCustomers(params: {
    limit?: number;
    sinceId?: string;
    createdAtMin?: string;
    createdAtMax?: string;
    updatedAtMin?: string;
    updatedAtMax?: string;
  } = {}): Promise<ShopifyApiResponse<{ customers: ShopifyCustomer[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest<{ customers: ShopifyCustomer[] }>(
      `/customers.json?${searchParams.toString()}`
    );
  }

  async getCustomer(customerId: string): Promise<ShopifyApiResponse<{ customer: ShopifyCustomer }>> {
    return this.makeRequest<{ customer: ShopifyCustomer }>(`/customers/${customerId}.json`);
  }

  // Products API
  async getProducts(params: {
    limit?: number;
    sinceId?: string;
    createdAtMin?: string;
    createdAtMax?: string;
    updatedAtMin?: string;
    updatedAtMax?: string;
    status?: 'active' | 'archived' | 'draft';
  } = {}): Promise<ShopifyApiResponse<{ products: ShopifyProduct[] }>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest<{ products: ShopifyProduct[] }>(
      `/products.json?${searchParams.toString()}`
    );
  }

  async getProduct(productId: string): Promise<ShopifyApiResponse<{ product: ShopifyProduct }>> {
    return this.makeRequest<{ product: ShopifyProduct }>(`/products/${productId}.json`);
  }

  // Webhook management
  async createWebhook(webhook: {
    topic: string;
    address: string;
    format?: 'json' | 'xml';
  }): Promise<ShopifyApiResponse<{ webhook: any }>> {
    return this.makeRequest<{ webhook: any }>('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({ webhook }),
    });
  }

  async getWebhooks(): Promise<ShopifyApiResponse<{ webhooks: any[] }>> {
    return this.makeRequest<{ webhooks: any[] }>('/webhooks.json');
  }

  async deleteWebhook(webhookId: string): Promise<ShopifyApiResponse<{}>> {
    return this.makeRequest<{}>(`/webhooks/${webhookId}.json`, {
      method: 'DELETE',
    });
  }

  // Shop information
  async getShop(): Promise<ShopifyApiResponse<{ shop: any }>> {
    return this.makeRequest<{ shop: any }>('/shop.json');
  }

  // Batch operations with rate limiting
  async batchImport<T>(
    fetchFunction: (cursor?: string) => Promise<ShopifyApiResponse<T[]>>,
    onBatch?: (items: T[], batchNumber: number) => Promise<void>,
    maxBatches?: number
  ): Promise<{ items: T[]; totalBatches: number; errors: any[] }> {
    const allItems: T[] = [];
    const errors: any[] = [];
    let batchNumber = 0;
    let cursor: string | undefined;

    while (true) {
      if (maxBatches && batchNumber >= maxBatches) {
        break;
      }

      const response = await fetchFunction(cursor);
      
      if (!response.success) {
        errors.push({
          batch: batchNumber,
          errors: response.errors,
        });
        break;
      }

      const items = response.data || [];
      allItems.push(...items);
      batchNumber++;

      // Call the batch processor if provided
      if (onBatch) {
        try {
          await onBatch(items, batchNumber);
        } catch (error) {
          errors.push({
            batch: batchNumber,
            error: error instanceof Error ? error.message : 'Batch processing failed',
          });
        }
      }

      // Check if we have more data (simplified pagination)
      if (items.length === 0) {
        break;
      }

      // Implement rate limiting delay
      if (response.rateLimitRemaining !== undefined && response.rateLimitRemaining < 10) {
        console.log('Rate limit approaching, waiting...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // For this example, we'll use a simple approach to pagination
      // In a real implementation, you'd use the Link header or cursor-based pagination
      if (items.length < 250) { // Shopify default limit
        break;
      }

      // Set cursor for next batch (simplified - in real implementation, extract from response headers)
      const lastItem = items[items.length - 1] as any;
      cursor = lastItem?.id?.toString();
    }

    return {
      items: allItems,
      totalBatches: batchNumber,
      errors,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.getShop();
      return response.success;
    } catch {
      return false;
    }
  }
}

// Factory function to create Shopify client instances
export function createShopifyClient(config: ShopifyClientConfig): ShopifyClient {
  return new ShopifyClient(config);
}

// Helper function to validate Shopify store URL
export function isValidShopifyUrl(url: string): boolean {
  const shopifyUrlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return shopifyUrlRegex.test(url);
}

// Helper function to extract store name from URL
export function extractStoreName(url: string): string | null {
  const match = url.match(/^([a-zA-Z0-9-]+)\.myshopify\.com$/);
  return match ? match[1] : null;
}
