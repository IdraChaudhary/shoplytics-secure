import { pgTable, text, timestamp, uuid, boolean, json, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './stores';
import { orders } from './orders';

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Shopify customer data (encrypted sensitive fields)
  shopifyCustomerId: text('shopify_customer_id').notNull(),
  email: text('email'), // Encrypted - primary identifier
  firstName: text('first_name'), // Encrypted
  lastName: text('last_name'), // Encrypted
  phone: text('phone'), // Encrypted
  
  // Customer status
  acceptsMarketing: boolean('accepts_marketing').default(false),
  marketingOptInLevel: text('marketing_opt_in_level'),
  emailVerified: boolean('email_verified').default(false),
  
  // Address information (encrypted)
  defaultAddressData: json('default_address_data'), // Encrypted JSON
  
  // Customer analytics (non-encrypted aggregated data)
  totalOrders: integer('total_orders').default(0),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0.00'),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).default('0.00'),
  
  // Customer lifecycle
  firstOrderAt: timestamp('first_order_at'),
  lastOrderAt: timestamp('last_order_at'),
  customerLifetimeValue: decimal('customer_lifetime_value', { precision: 10, scale: 2 }).default('0.00'),
  
  // AI-powered insights (non-encrypted aggregated insights)
  churnRiskScore: decimal('churn_risk_score', { precision: 3, scale: 2 }), // 0.00 to 1.00
  segmentTag: text('segment_tag'), // high-value, at-risk, new, etc.
  predictedNextPurchaseDate: timestamp('predicted_next_purchase_date'),
  
  // Privacy and compliance
  dataProcessingConsent: boolean('data_processing_consent').default(false),
  consentGivenAt: timestamp('consent_given_at'),
  consentWithdrawnAt: timestamp('consent_withdrawn_at'),
  gdprDataRequest: text('gdpr_data_request'), // export, delete, etc.
  dataRetentionExpiresAt: timestamp('data_retention_expires_at'),
  
  // Shopify metadata
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  tags: text('tags').array(), // Non-sensitive tags
  note: text('note'), // Encrypted if contains PII
  
  // System timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete for compliance
});

export const customerSegments = pgTable('customer_segments', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  name: text('name').notNull(),
  description: text('description'),
  criteria: json('criteria').notNull(), // JSON object defining segment rules
  customerCount: integer('customer_count').default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customerSegmentMembership = pgTable('customer_segment_membership', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  segmentId: uuid('segment_id').notNull().references(() => customerSegments.id),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  removedAt: timestamp('removed_at'),
});

// Relations
export const customersRelations = relations(customers, ({ one, many }) => ({
  store: one(stores, {
    fields: [customers.storeId],
    references: [stores.id],
  }),
  orders: many(orders),
  segmentMemberships: many(customerSegmentMembership),
}));

export const customerSegmentsRelations = relations(customerSegments, ({ one, many }) => ({
  store: one(stores, {
    fields: [customerSegments.storeId],
    references: [stores.id],
  }),
  memberships: many(customerSegmentMembership),
}));

export const customerSegmentMembershipRelations = relations(customerSegmentMembership, ({ one }) => ({
  customer: one(customers, {
    fields: [customerSegmentMembership.customerId],
    references: [customers.id],
  }),
  segment: one(customerSegments, {
    fields: [customerSegmentMembership.segmentId],
    references: [customerSegments.id],
  }),
}));
