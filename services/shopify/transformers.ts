import { Customer, Product, Order, OrderLineItem, OrderEvent, OrderStatus, OrderEventType } from '@prisma/client';
import crypto from 'crypto';

// Encryption utility for PII data
const encrypt = (text: string): string => {
  const algorithm = 'aes-256-cbc';
  const key = process.env.ENCRYPTION_KEY || 'fallback-key-32-chars-long!!!';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Shopify data type interfaces
export interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string | null;
  currency: string;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: string[];
  sms_marketing_consent: any;
  admin_graphql_api_id: string;
  default_address: ShopifyAddress | null;
}

export interface ShopifyAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number | null;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  client_details: any;
  closed_at: string | null;
  confirmed: boolean;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: any;
  current_total_discounts: string;
  current_total_discounts_set: any;
  current_total_duties_set: any;
  current_total_price: string;
  current_total_price_set: any;
  current_total_tax: string;
  current_total_tax_set: any;
  customer_locale: string | null;
  device_id: number | null;
  discount_codes: any[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string | null;
  gateway: string;
  landing_site: string | null;
  landing_site_ref: string | null;
  location_id: number | null;
  name: string;
  note: string | null;
  note_attributes: any[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_duties_set: any;
  payment_gateway_names: string[];
  phone: string | null;
  presentment_currency: string;
  processed_at: string;
  processing_method: string;
  reference: string | null;
  referring_site: string | null;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  subtotal_price_set: any;
  tags: string;
  tax_lines: any[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: any;
  total_line_items_price: string;
  total_line_items_price_set: any;
  total_outstanding: string;
  total_price: string;
  total_price_set: any;
  total_price_usd: string;
  total_shipping_price_set: any;
  total_tax: string;
  total_tax_set: any;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  billing_address: ShopifyAddress | null;
  customer: ShopifyCustomer;
  discount_applications: any[];
  fulfillments: any[];
  line_items: ShopifyLineItem[];
  payment_details: any;
  refunds: any[];
  shipping_address: ShopifyAddress | null;
  shipping_lines: any[];
}

export interface ShopifyLineItem {
  id: number;
  admin_graphql_api_id: string;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  origin_location: any;
  price: string;
  price_set: any;
  product_exists: boolean;
  product_id: number | null;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sku: string | null;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: any;
  variant_id: number | null;
  variant_inventory_management: string | null;
  variant_title: string | null;
  vendor: string | null;
  tax_lines: any[];
  duties: any[];
  discount_allocations: any[];
}

// Transformation functions
export class ShopifyTransformer {
  static transformCustomer(shopifyCustomer: ShopifyCustomer, tenantId: string): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      shopifyId: shopifyCustomer.id.toString(),
      tenantId,
      email: encrypt(shopifyCustomer.email),
      firstName: shopifyCustomer.first_name ? encrypt(shopifyCustomer.first_name) : null,
      lastName: shopifyCustomer.last_name ? encrypt(shopifyCustomer.last_name) : null,
      phone: shopifyCustomer.phone ? encrypt(shopifyCustomer.phone) : null,
      acceptsMarketing: shopifyCustomer.accepts_marketing,
      ordersCount: shopifyCustomer.orders_count,
      totalSpent: parseFloat(shopifyCustomer.total_spent),
      tags: shopifyCustomer.tags || null,
      state: shopifyCustomer.state,
      verified: shopifyCustomer.verified_email,
      currency: shopifyCustomer.currency,
      lastOrderId: shopifyCustomer.last_order_id?.toString() || null,
      lastOrderName: shopifyCustomer.last_order_name,
      taxExempt: shopifyCustomer.tax_exempt,
      note: shopifyCustomer.note,
      marketingOptInLevel: shopifyCustomer.marketing_opt_in_level,
      shopifyCreatedAt: new Date(shopifyCustomer.created_at),
      shopifyUpdatedAt: new Date(shopifyCustomer.updated_at)
    };
  }

  static transformProduct(shopifyProduct: ShopifyProduct, tenantId: string): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
    // Calculate price range from variants
    const prices = shopifyProduct.variants.map(v => parseFloat(v.price)).filter(p => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    // Calculate total inventory
    const totalInventory = shopifyProduct.variants.reduce((sum, variant) => {
      return sum + (variant.inventory_quantity || 0);
    }, 0);

    return {
      shopifyId: shopifyProduct.id.toString(),
      tenantId,
      title: shopifyProduct.title,
      description: shopifyProduct.body_html,
      vendor: shopifyProduct.vendor,
      productType: shopifyProduct.product_type,
      handle: shopifyProduct.handle,
      tags: shopifyProduct.tags || null,
      status: shopifyProduct.status,
      publishedAt: shopifyProduct.published_at ? new Date(shopifyProduct.published_at) : null,
      imageUrl: shopifyProduct.image?.src || null,
      priceMin: minPrice,
      priceMax: maxPrice,
      variantsCount: shopifyProduct.variants.length,
      totalInventory,
      shopifyCreatedAt: new Date(shopifyProduct.created_at),
      shopifyUpdatedAt: new Date(shopifyProduct.updated_at)
    };
  }

  static mapOrderStatus(shopifyStatus: string): OrderStatus {
    switch (shopifyStatus.toLowerCase()) {
      case 'open':
        return OrderStatus.PENDING;
      case 'closed':
        return OrderStatus.FULFILLED;
      case 'cancelled':
        return OrderStatus.CANCELLED;
      default:
        return OrderStatus.PENDING;
    }
  }

  static transformOrder(shopifyOrder: ShopifyOrder, tenantId: string): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      shopifyId: shopifyOrder.id.toString(),
      tenantId,
      customerId: shopifyOrder.customer ? shopifyOrder.customer.id.toString() : null,
      orderNumber: shopifyOrder.number.toString(),
      name: shopifyOrder.name,
      email: shopifyOrder.email ? encrypt(shopifyOrder.email) : null,
      phone: shopifyOrder.phone ? encrypt(shopifyOrder.phone) : null,
      currency: shopifyOrder.currency,
      totalPrice: parseFloat(shopifyOrder.total_price),
      subtotalPrice: parseFloat(shopifyOrder.subtotal_price),
      totalTax: parseFloat(shopifyOrder.total_tax),
      totalDiscounts: parseFloat(shopifyOrder.total_discounts),
      totalWeight: shopifyOrder.total_weight,
      itemCount: shopifyOrder.line_items.length,
      status: this.mapOrderStatus(shopifyOrder.financial_status),
      financialStatus: shopifyOrder.financial_status,
      fulfillmentStatus: shopifyOrder.fulfillment_status,
      tags: shopifyOrder.tags || null,
      note: shopifyOrder.note,
      gateway: shopifyOrder.gateway,
      test: shopifyOrder.test,
      browserIp: shopifyOrder.browser_ip,
      landingSite: shopifyOrder.landing_site,
      referringSite: shopifyOrder.referring_site,
      sourceName: shopifyOrder.source_name,
      cancelledAt: shopifyOrder.cancelled_at ? new Date(shopifyOrder.cancelled_at) : null,
      closedAt: shopifyOrder.closed_at ? new Date(shopifyOrder.closed_at) : null,
      processedAt: new Date(shopifyOrder.processed_at),
      shopifyCreatedAt: new Date(shopifyOrder.created_at),
      shopifyUpdatedAt: new Date(shopifyOrder.updated_at)
    };
  }

  static transformOrderLineItem(
    shopifyLineItem: ShopifyLineItem, 
    orderId: string, 
    tenantId: string
  ): Omit<OrderLineItem, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      shopifyId: shopifyLineItem.id.toString(),
      orderId,
      tenantId,
      productId: shopifyLineItem.product_id?.toString() || null,
      variantId: shopifyLineItem.variant_id?.toString() || null,
      title: shopifyLineItem.title,
      name: shopifyLineItem.name,
      sku: shopifyLineItem.sku,
      vendor: shopifyLineItem.vendor,
      quantity: shopifyLineItem.quantity,
      price: parseFloat(shopifyLineItem.price),
      totalDiscount: parseFloat(shopifyLineItem.total_discount),
      grams: shopifyLineItem.grams,
      requiresShipping: shopifyLineItem.requires_shipping,
      taxable: shopifyLineItem.taxable,
      fulfillmentStatus: shopifyLineItem.fulfillment_status,
      fulfillableQuantity: shopifyLineItem.fulfillable_quantity,
      variantTitle: shopifyLineItem.variant_title
    };
  }

  static createOrderEvent(
    orderId: string, 
    tenantId: string, 
    eventType: OrderEventType, 
    description: string,
    metadata?: Record<string, any>
  ): Omit<OrderEvent, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      orderId,
      tenantId,
      eventType,
      description,
      metadata
    };
  }

  // Batch transformation utilities
  static transformCustomersBatch(
    shopifyCustomers: ShopifyCustomer[], 
    tenantId: string
  ): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] {
    return shopifyCustomers.map(customer => this.transformCustomer(customer, tenantId));
  }

  static transformProductsBatch(
    shopifyProducts: ShopifyProduct[], 
    tenantId: string
  ): Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] {
    return shopifyProducts.map(product => this.transformProduct(product, tenantId));
  }

  static transformOrdersBatch(
    shopifyOrders: ShopifyOrder[], 
    tenantId: string
  ): {
    orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[];
    lineItems: Omit<OrderLineItem, 'id' | 'createdAt' | 'updatedAt'>[];
    events: Omit<OrderEvent, 'id' | 'createdAt' | 'updatedAt'>[];
  } {
    const orders: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const lineItems: Omit<OrderLineItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const events: Omit<OrderEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    shopifyOrders.forEach(shopifyOrder => {
      const order = this.transformOrder(shopifyOrder, tenantId);
      orders.push(order);

      // Transform line items
      shopifyOrder.line_items.forEach(lineItem => {
        const transformedLineItem = this.transformOrderLineItem(
          lineItem, 
          shopifyOrder.id.toString(), 
          tenantId
        );
        lineItems.push(transformedLineItem);
      });

      // Create order events
      const orderCreatedEvent = this.createOrderEvent(
        shopifyOrder.id.toString(),
        tenantId,
        OrderEventType.CREATED,
        `Order ${shopifyOrder.name} created`,
        {
          source: 'shopify_sync',
          financial_status: shopifyOrder.financial_status,
          fulfillment_status: shopifyOrder.fulfillment_status
        }
      );
      events.push(orderCreatedEvent);

      // Add fulfillment events if applicable
      if (shopifyOrder.fulfillment_status) {
        const fulfillmentEvent = this.createOrderEvent(
          shopifyOrder.id.toString(),
          tenantId,
          OrderEventType.FULFILLED,
          `Order fulfillment status: ${shopifyOrder.fulfillment_status}`,
          {
            fulfillment_status: shopifyOrder.fulfillment_status
          }
        );
        events.push(fulfillmentEvent);
      }

      // Add cancellation events if applicable
      if (shopifyOrder.cancelled_at) {
        const cancellationEvent = this.createOrderEvent(
          shopifyOrder.id.toString(),
          tenantId,
          OrderEventType.CANCELLED,
          `Order cancelled: ${shopifyOrder.cancel_reason || 'No reason provided'}`,
          {
            cancelled_at: shopifyOrder.cancelled_at,
            cancel_reason: shopifyOrder.cancel_reason
          }
        );
        events.push(cancellationEvent);
      }
    });

    return { orders, lineItems, events };
  }

  // Webhook data transformation
  static transformWebhookData(webhookTopic: string, data: any, tenantId: string) {
    switch (webhookTopic) {
      case 'customers/create':
      case 'customers/update':
        return this.transformCustomer(data, tenantId);
      
      case 'products/create':
      case 'products/update':
        return this.transformProduct(data, tenantId);
      
      case 'orders/create':
      case 'orders/updated':
      case 'orders/paid':
      case 'orders/cancelled':
      case 'orders/fulfilled':
        const orderData = this.transformOrdersBatch([data], tenantId);
        return {
          order: orderData.orders[0],
          lineItems: orderData.lineItems,
          events: orderData.events
        };
      
      default:
        return null;
    }
  }

  // Data validation helpers
  static validateCustomerData(customer: ShopifyCustomer): boolean {
    return !!(customer.id && customer.email);
  }

  static validateProductData(product: ShopifyProduct): boolean {
    return !!(product.id && product.title);
  }

  static validateOrderData(order: ShopifyOrder): boolean {
    return !!(order.id && order.created_at && order.total_price);
  }

  // Data cleaning utilities
  static cleanPhoneNumber(phone: string | null): string | null {
    if (!phone) return null;
    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '') || null;
  }

  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizeHtml(html: string | null): string | null {
    if (!html) return null;
    // Basic HTML sanitization - remove script tags and normalize
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
  }
}

// Export transformation utility functions
export const transformShopifyData = {
  customer: (data: ShopifyCustomer, tenantId: string) => ShopifyTransformer.transformCustomer(data, tenantId),
  product: (data: ShopifyProduct, tenantId: string) => ShopifyTransformer.transformProduct(data, tenantId),
  order: (data: ShopifyOrder, tenantId: string) => ShopifyTransformer.transformOrder(data, tenantId),
  orderLineItem: (data: ShopifyLineItem, orderId: string, tenantId: string) => 
    ShopifyTransformer.transformOrderLineItem(data, orderId, tenantId),
  webhook: (topic: string, data: any, tenantId: string) => ShopifyTransformer.transformWebhookData(topic, data, tenantId)
};
