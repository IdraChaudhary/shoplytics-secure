import { pgTable, text, timestamp, uuid, boolean, json, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './stores';
import { customers } from './customers';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  customerId: uuid('customer_id').references(() => customers.id),
  
  // Shopify order identifiers
  shopifyOrderId: text('shopify_order_id').notNull(),
  orderNumber: text('order_number').notNull(),
  name: text('name'), // e.g., #1001
  
  // Order financial data
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  subtotalPrice: decimal('subtotal_price', { precision: 10, scale: 2 }),
  totalTax: decimal('total_tax', { precision: 10, scale: 2 }),
  totalDiscounts: decimal('total_discounts', { precision: 10, scale: 2 }),
  totalShipping: decimal('total_shipping', { precision: 10, scale: 2 }),
  currency: text('currency').notNull(),
  
  // Order status and fulfillment
  financialStatus: text('financial_status'), // paid, pending, refunded, etc.
  fulfillmentStatus: text('fulfillment_status'), // fulfilled, partial, unfulfilled
  orderStatus: text('order_status'), // open, closed, cancelled
  
  // Customer information (encrypted for guest checkouts)
  customerEmail: text('customer_email'), // Encrypted
  billingAddress: json('billing_address'), // Encrypted JSON
  shippingAddress: json('shipping_address'), // Encrypted JSON
  
  // Order metadata
  tags: text('tags').array(),
  note: text('note'), // Encrypted if contains PII
  sourceIdentifier: text('source_identifier'), // web, mobile, pos, etc.
  referringSite: text('referring_site'),
  landingSite: text('landing_site'),
  
  // Processing information
  processedAt: timestamp('processed_at'),
  cancelledAt: timestamp('cancelled_at'),
  closedAt: timestamp('closed_at'),
  cancelReason: text('cancel_reason'),
  
  // Line items count and analytics
  lineItemsCount: integer('line_items_count').default(0),
  uniqueProductsCount: integer('unique_products_count').default(0),
  
  // AI-powered insights (aggregated, non-encrypted)
  riskScore: decimal('risk_score', { precision: 3, scale: 2 }), // Fraud risk
  customerSegment: text('customer_segment'),
  orderPattern: text('order_pattern'), // regular, seasonal, bulk, etc.
  
  // Shopify timestamps
  shopifyCreatedAt: timestamp('shopify_created_at').notNull(),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  
  // System timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderLineItems = pgTable('order_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Shopify line item data
  shopifyLineItemId: text('shopify_line_item_id').notNull(),
  productId: text('product_id'),
  variantId: text('variant_id'),
  
  // Product details
  productTitle: text('product_title'),
  variantTitle: text('variant_title'),
  sku: text('sku'),
  vendor: text('vendor'),
  productType: text('product_type'),
  
  // Pricing and quantity
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  totalDiscount: decimal('total_discount', { precision: 10, scale: 2 }).default('0.00'),
  
  // Product metadata
  requiresShipping: boolean('requires_shipping').default(true),
  taxable: boolean('taxable').default(true),
  grams: integer('grams'), // Weight
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderEvents = pgTable('order_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  eventType: text('event_type').notNull(), // created, updated, paid, fulfilled, cancelled
  eventData: json('event_data'), // Additional event context
  message: text('message'),
  
  // Timestamps
  occurredAt: timestamp('occurred_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  store: one(stores, {
    fields: [orders.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  lineItems: many(orderLineItems),
  events: many(orderEvents),
}));

export const orderLineItemsRelations = relations(orderLineItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderLineItems.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [orderLineItems.storeId],
    references: [stores.id],
  }),
}));

export const orderEventsRelations = relations(orderEvents, ({ one }) => ({
  order: one(orders, {
    fields: [orderEvents.orderId],
    references: [orders.id],
  }),
  store: one(stores, {
    fields: [orderEvents.storeId],
    references: [stores.id],
  }),
}));
