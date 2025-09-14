import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { 
  dashboardCustomers, 
  dashboardOrders, 
  dashboardProducts, 
  tenants,
  webhookLogs,
  analyticsCache
} from '@/lib/database/schemas/tenants';

export type InsertTenant = InferInsertModel<typeof tenants>;
export type SelectTenant = InferSelectModel<typeof tenants>;

export type InsertCustomer = InferInsertModel<typeof dashboardCustomers>;
export type SelectCustomer = InferSelectModel<typeof dashboardCustomers>;

export type InsertOrder = InferInsertModel<typeof dashboardOrders>;
export type SelectOrder = InferSelectModel<typeof dashboardOrders>;

export type InsertProduct = InferInsertModel<typeof dashboardProducts>;
export type SelectProduct = InferSelectModel<typeof dashboardProducts>;

export type InsertWebhookLog = InferInsertModel<typeof webhookLogs>;
export type SelectWebhookLog = InferSelectModel<typeof webhookLogs>;

export type InsertAnalyticsCache = InferInsertModel<typeof analyticsCache>;
export type SelectAnalyticsCache = InferSelectModel<typeof analyticsCache>;