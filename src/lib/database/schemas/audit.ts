import { pgTable, text, timestamp, uuid, json, inet } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { stores } from './stores';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Core audit fields
  action: text('action').notNull(), // CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
  resourceType: text('resource_type').notNull(), // USER, STORE, CUSTOMER, ORDER, etc.
  resourceId: text('resource_id'), // ID of the affected resource
  
  // Actor information
  userId: uuid('user_id').references(() => users.id),
  storeId: uuid('store_id').references(() => stores.id),
  actorType: text('actor_type').notNull(), // USER, SYSTEM, API, WEBHOOK
  actorId: text('actor_id'), // External actor ID (e.g., API key ID)
  
  // Context and details
  description: text('description').notNull(),
  metadata: json('metadata'), // Additional context data
  beforeData: json('before_data'), // State before change
  afterData: json('after_data'), // State after change
  
  // Request information
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  requestId: text('request_id'), // For tracing
  sessionId: text('session_id'),
  
  // Compliance and privacy
  gdprRelevant: text('gdpr_relevant'), // YES, NO, POTENTIAL
  dataClassification: text('data_classification'), // PUBLIC, INTERNAL, CONFIDENTIAL, PII
  
  // System information
  severity: text('severity', { enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }).default('MEDIUM'),
  status: text('status', { enum: ['SUCCESS', 'FAILURE', 'PARTIAL'] }).notNull(),
  errorMessage: text('error_message'),
  
  // Timestamps
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dataVersions = pgTable('data_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Resource identification
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Version information
  version: text('version').notNull(),
  previousVersion: text('previous_version'),
  
  // Data snapshot (encrypted if contains PII)
  dataSnapshot: json('data_snapshot').notNull(),
  changesSummary: json('changes_summary'),
  
  // Change tracking
  changedBy: uuid('changed_by').references(() => users.id),
  changeReason: text('change_reason'),
  auditLogId: uuid('audit_log_id').references(() => auditLogs.id),
  
  // Metadata
  isActive: text('is_active').default('true'), // For rollback capabilities
  retentionExpiresAt: timestamp('retention_expires_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Alert details
  type: text('type').notNull(), // ANOMALY, SECURITY, COMPLIANCE, CHURN_RISK, etc.
  severity: text('severity', { enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  
  // Alert data
  triggerData: json('trigger_data'), // Data that triggered the alert
  thresholds: json('thresholds'), // Threshold values that were crossed
  affectedResources: json('affected_resources'), // Resources involved
  
  // Alert state
  status: text('status', { enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'] }).default('ACTIVE'),
  acknowledgedBy: uuid('acknowledged_by').references(() => users.id),
  acknowledgedAt: timestamp('acknowledged_at'),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'),
  
  // Notification tracking
  notificationsSent: json('notifications_sent'), // Track what notifications were sent
  lastNotificationAt: timestamp('last_notification_at'),
  
  // AI and analytics
  confidenceScore: text('confidence_score'), // AI confidence in the alert
  falsePositive: text('false_positive'), // Marked as false positive for learning
  
  // Timestamps
  triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [auditLogs.storeId],
    references: [stores.id],
  }),
}));

export const dataVersionsRelations = relations(dataVersions, ({ one }) => ({
  store: one(stores, {
    fields: [dataVersions.storeId],
    references: [stores.id],
  }),
  changedByUser: one(users, {
    fields: [dataVersions.changedBy],
    references: [users.id],
  }),
  auditLog: one(auditLogs, {
    fields: [dataVersions.auditLogId],
    references: [auditLogs.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  store: one(stores, {
    fields: [alerts.storeId],
    references: [stores.id],
  }),
  acknowledgedByUser: one(users, {
    fields: [alerts.acknowledgedBy],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [alerts.resolvedBy],
    references: [users.id],
  }),
}));
