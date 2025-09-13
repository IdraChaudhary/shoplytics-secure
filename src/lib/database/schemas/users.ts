import { pgTable, text, timestamp, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './stores';
import { auditLogs } from './audit';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(), // This will be encrypted
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'), // Encrypted
  lastName: text('last_name'), // Encrypted
  role: text('role', { enum: ['admin', 'analyst', 'viewer'] }).notNull().default('viewer'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  emailVerified: boolean('email_verified').notNull().default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  // Multi-tenant support
  defaultStoreId: uuid('default_store_id'),
  // Privacy settings
  dataRetentionDays: integer('data_retention_days').default(365),
  consentGiven: boolean('consent_given').notNull().default(false),
  consentGivenAt: timestamp('consent_given_at'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft delete for compliance
});

export const userStoreAccess = pgTable('user_store_access', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  role: text('role', { enum: ['owner', 'admin', 'analyst', 'viewer'] }).notNull(),
  permissions: text('permissions').array(), // JSON array of specific permissions
  isActive: boolean('is_active').notNull().default(true),
  grantedBy: uuid('granted_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  storeAccesses: many(userStoreAccess),
  auditLogs: many(auditLogs),
  defaultStore: one(stores, {
    fields: [users.defaultStoreId],
    references: [stores.id],
  }),
}));

export const userStoreAccessRelations = relations(userStoreAccess, ({ one }) => ({
  user: one(users, {
    fields: [userStoreAccess.userId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [userStoreAccess.storeId],
    references: [stores.id],
  }),
  grantedByUser: one(users, {
    fields: [userStoreAccess.grantedBy],
    references: [users.id],
  }),
}));
