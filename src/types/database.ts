import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { customers, orders, orderLineItems, orderEvents, products, productVariants } from '@/lib/database/schemas';

export type InsertCustomer = InferInsertModel<typeof customers>;
export type SelectCustomer = InferSelectModel<typeof customers>;

export type InsertOrder = InferInsertModel<typeof orders>;
export type SelectOrder = InferSelectModel<typeof orders>;

export type InsertOrderLineItem = InferInsertModel<typeof orderLineItems>;
export type SelectOrderLineItem = InferSelectModel<typeof orderLineItems>;

export type InsertOrderEvent = InferInsertModel<typeof orderEvents>;
export type SelectOrderEvent = InferSelectModel<typeof orderEvents>;

export type InsertProduct = InferInsertModel<typeof products>;
export type SelectProduct = InferSelectModel<typeof products>;

export type InsertProductVariant = InferInsertModel<typeof productVariants>;
export type SelectProductVariant = InferSelectModel<typeof productVariants>;