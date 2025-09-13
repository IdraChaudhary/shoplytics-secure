import { pgTable, serial, varchar, text, timestamp, boolean, decimal, integer, index, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Core tenant table for multi-tenancy
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  shopifyStoreUrl: varchar('shopify_store_url', { length: 255 }).notNull().unique(),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  shopifyAccessToken: text('shopify_access_token'), // Encrypted
  webhookSecret: varchar('webhook_secret', { length: 255 }),
  isActive: boolean('is_active').default(true),
  settings: json('settings'), // Store tenant-specific settings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    apiKeyIdx: index('tenants_api_key_idx').on(table.apiKey),
    storeUrlIdx: index('tenants_store_url_idx').on(table.shopifyStoreUrl),
  };
});

// Customers table for Shopify customer data
export const dashboardCustomers = pgTable('dashboard_customers', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  shopifyCustomerId: varchar('shopify_customer_id', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0.00'),
  ordersCount: integer('orders_count').default(0),
  state: varchar('state', { length: 50 }).default('enabled'),
  acceptsMarketing: boolean('accepts_marketing').default(false),
  tags: text('tags'),
  lastOrderDate: timestamp('last_order_date'),
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantShopifyCustomerIdx: index('dashboard_customers_tenant_shopify_id_idx').on(table.tenantId, table.shopifyCustomerId),
    tenantEmailIdx: index('dashboard_customers_tenant_email_idx').on(table.tenantId, table.email),
    totalSpentIdx: index('dashboard_customers_total_spent_idx').on(table.totalSpent),
    lastOrderDateIdx: index('dashboard_customers_last_order_date_idx').on(table.lastOrderDate),
  };
});

// Products table for Shopify product data
export const dashboardProducts = pgTable('dashboard_products', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  shopifyProductId: varchar('shopify_product_id', { length: 100 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  handle: varchar('handle', { length: 255 }),
  vendor: varchar('vendor', { length: 255 }),
  productType: varchar('product_type', { length: 255 }),
  status: varchar('status', { length: 50 }).default('active'),
  tags: text('tags'),
  price: decimal('price', { precision: 10, scale: 2 }),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  variants: json('variants'), // Store variant data as JSON
  images: json('images'), // Store image data as JSON
  totalSales: decimal('total_sales', { precision: 10, scale: 2 }).default('0.00'),
  totalQuantitySold: integer('total_quantity_sold').default(0),
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantShopifyProductIdx: index('dashboard_products_tenant_shopify_id_idx').on(table.tenantId, table.shopifyProductId),
    tenantTitleIdx: index('dashboard_products_tenant_title_idx').on(table.tenantId, table.title),
    statusIdx: index('dashboard_products_status_idx').on(table.status),
    totalSalesIdx: index('dashboard_products_total_sales_idx').on(table.totalSales),
  };
});

// Orders table for Shopify order data
export const dashboardOrders = pgTable('dashboard_orders', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  shopifyOrderId: varchar('shopify_order_id', { length: 100 }).notNull(),
  customerId: integer('customer_id').references(() => dashboardCustomers.id),
  orderNumber: varchar('order_number', { length: 100 }),
  email: varchar('email', { length: 255 }),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  subtotalPrice: decimal('subtotal_price', { precision: 10, scale: 2 }),
  totalTax: decimal('total_tax', { precision: 10, scale: 2 }),
  totalDiscounts: decimal('total_discounts', { precision: 10, scale: 2 }).default('0.00'),
  shippingPrice: decimal('shipping_price', { precision: 10, scale: 2 }).default('0.00'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  financialStatus: varchar('financial_status', { length: 50 }),
  fulfillmentStatus: varchar('fulfillment_status', { length: 50 }),
  source: varchar('source', { length: 100 }), // web, mobile, etc.
  orderDate: timestamp('order_date').notNull(),
  processedAt: timestamp('processed_at'),
  cancelledAt: timestamp('cancelled_at'),
  lineItems: json('line_items'), // Store line items as JSON
  billingAddress: json('billing_address'),
  shippingAddress: json('shipping_address'),
  discountCodes: json('discount_codes'),
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    tenantShopifyOrderIdx: index('dashboard_orders_tenant_shopify_id_idx').on(table.tenantId, table.shopifyOrderId),
    tenantOrderDateIdx: index('dashboard_orders_tenant_date_idx').on(table.tenantId, table.orderDate),
    customerIdx: index('dashboard_orders_customer_idx').on(table.customerId),
    totalPriceIdx: index('dashboard_orders_total_price_idx').on(table.totalPrice),
    financialStatusIdx: index('dashboard_orders_financial_status_idx').on(table.financialStatus),
    orderDateIdx: index('dashboard_orders_date_idx').on(table.orderDate),
  };
});

// Webhook logs for debugging and monitoring
export const webhookLogs = pgTable('webhook_logs', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id),
  topic: varchar('topic', { length: 100 }).notNull(),
  shopifyId: varchar('shopify_id', { length: 100 }),
  payload: json('payload'),
  processed: boolean('processed').default(false),
  error: text('error'),
  processingTime: integer('processing_time'), // milliseconds
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantTopicIdx: index('webhook_logs_tenant_topic_idx').on(table.tenantId, table.topic),
    processedIdx: index('webhook_logs_processed_idx').on(table.processed),
    createdAtIdx: index('webhook_logs_created_at_idx').on(table.createdAt),
  };
});

// Analytics cache for performance
export const analyticsCache = pgTable('analytics_cache', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  cacheKey: varchar('cache_key', { length: 255 }).notNull(),
  data: json('data').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    tenantCacheKeyIdx: index('analytics_cache_tenant_key_idx').on(table.tenantId, table.cacheKey),
    expiresAtIdx: index('analytics_cache_expires_at_idx').on(table.expiresAt),
  };
});

// Relations
export const tenantRelations = relations(tenants, ({ many }) => ({
  customers: many(dashboardCustomers),
  products: many(dashboardProducts),
  orders: many(dashboardOrders),
  webhookLogs: many(webhookLogs),
  analyticsCache: many(analyticsCache),
}));

export const customerRelations = relations(dashboardCustomers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [dashboardCustomers.tenantId],
    references: [tenants.id],
  }),
  orders: many(dashboardOrders),
}));

export const productRelations = relations(dashboardProducts, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dashboardProducts.tenantId],
    references: [tenants.id],
  }),
}));

export const orderRelations = relations(dashboardOrders, ({ one }) => ({
  tenant: one(tenants, {
    fields: [dashboardOrders.tenantId],
    references: [tenants.id],
  }),
  customer: one(dashboardCustomers, {
    fields: [dashboardOrders.customerId],
    references: [dashboardCustomers.id],
  }),
}));

export const webhookLogRelations = relations(webhookLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [webhookLogs.tenantId],
    references: [tenants.id],
  }),
}));

export const analyticsCacheRelations = relations(analyticsCache, ({ one }) => ({
  tenant: one(tenants, {
    fields: [analyticsCache.tenantId],
    references: [tenants.id],
  }),
}));
