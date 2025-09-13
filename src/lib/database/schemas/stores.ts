import { pgTable, text, timestamp, uuid, boolean, json, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { customers } from './customers';
import { orders } from './orders';
import { auditLogs } from './audit';

export const stores = pgTable('stores', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Shopify connection details (encrypted)
  shopifyDomain: text('shopify_domain').notNull().unique(), // e.g., mystore.myshopify.com
  shopifyAccessToken: text('shopify_access_token'), // Encrypted
  shopifyWebhookSecret: text('shopify_webhook_secret'), // Encrypted
  
  // Store information (some encrypted)
  storeName: text('store_name').notNull(), // Encrypted
  storeEmail: text('store_email'), // Encrypted
  currency: text('currency').notNull().default('USD'),
  timezone: text('timezone').notNull().default('UTC'),
  country: text('country'),
  
  // Shopify plan and limits
  shopifyPlan: text('shopify_plan'), // basic, shopify, advanced, plus
  webhookEndpointVerified: boolean('webhook_endpoint_verified').default(false),
  
  // Data sync settings
  lastSyncAt: timestamp('last_sync_at'),
  syncStatus: text('sync_status', { 
    enum: ['active', 'paused', 'error', 'initial'] 
  }).notNull().default('initial'),
  syncErrors: json('sync_errors').$type<string[]>(),
  
  // Privacy and compliance settings
  dataRetentionDays: integer('data_retention_days').default(730), // 2 years default
  gdprCompliant: boolean('gdpr_compliant').notNull().default(false),
  ccpaCompliant: boolean('ccpa_compliant').notNull().default(false),
  encryptionEnabled: boolean('encryption_enabled').notNull().default(true),
  
  // Analytics settings
  aiInsightsEnabled: boolean('ai_insights_enabled').notNull().default(true),
  alertsEnabled: boolean('alerts_enabled').notNull().default(true),
  customDashboard: json('custom_dashboard_config'),
  
  // Subscription and billing
  subscriptionTier: text('subscription_tier', {
    enum: ['starter', 'professional', 'enterprise']
  }).notNull().default('starter'),
  subscriptionStatus: text('subscription_status', {
    enum: ['active', 'canceled', 'past_due', 'trialing']
  }).notNull().default('trialing'),
  trialEndsAt: timestamp('trial_ends_at'),
  
  // Status and metadata
  isActive: boolean('is_active').notNull().default(true),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete
});

export const encryptionKeys = pgTable('encryption_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  keyVersion: integer('key_version').notNull(),
  encryptedKey: text('encrypted_key').notNull(), // The actual encryption key, encrypted with master key
  algorithm: text('algorithm').notNull().default('AES-256-GCM'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  rotatedAt: timestamp('rotated_at'),
  expiresAt: timestamp('expires_at'), // For automatic key rotation
});

// Relations
export const storesRelations = relations(stores, ({ many }) => ({
  customers: many(customers),
  orders: many(orders),
  auditLogs: many(auditLogs),
  encryptionKeys: many(encryptionKeys),
}));

export const encryptionKeysRelations = relations(encryptionKeys, ({ one }) => ({
  store: one(stores, {
    fields: [encryptionKeys.storeId],
    references: [stores.id],
  }),
}));
