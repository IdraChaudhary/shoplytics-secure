// Re-export all schemas and their relations for easy importing
export * from './users';
export * from './stores';
export * from './customers';
export * from './orders';
export * from './audit';

// Type definitions for easier use throughout the application
import { users, userStoreAccess } from './users';
import { stores, encryptionKeys } from './stores';
import { customers, customerSegments, customerSegmentMembership } from './customers';
import { orders, orderLineItems, orderEvents } from './orders';
import { auditLogs, dataVersions, alerts } from './audit';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderLineItem = typeof orderLineItems.$inferSelect;
export type NewOrderLineItem = typeof orderLineItems.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;

export type UserStoreAccess = typeof userStoreAccess.$inferSelect;
export type NewUserStoreAccess = typeof userStoreAccess.$inferInsert;

export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type NewEncryptionKey = typeof encryptionKeys.$inferInsert;

export type DataVersion = typeof dataVersions.$inferSelect;
export type NewDataVersion = typeof dataVersions.$inferInsert;

export type CustomerSegment = typeof customerSegments.$inferSelect;
export type NewCustomerSegment = typeof customerSegments.$inferInsert;
