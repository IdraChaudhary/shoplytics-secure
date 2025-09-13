import { pgTable, text, timestamp, uuid, boolean, json, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { stores } from './stores';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Shopify product identifiers
  shopifyProductId: text('shopify_product_id').notNull(),
  handle: text('handle').notNull(), // URL handle
  
  // Product basic info
  title: text('title').notNull(),
  description: text('description'),
  vendor: text('vendor'),
  productType: text('product_type'),
  
  // Product status
  status: text('status').notNull().default('active'), // active, archived, draft
  publishedAt: timestamp('published_at'),
  isPublished: boolean('is_published').default(true),
  
  // SEO and metadata
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  tags: text('tags').array(),
  
  // Product images
  images: json('images'), // Array of image URLs and alt texts
  featuredImage: text('featured_image'),
  
  // Product options (size, color, etc.)
  options: json('options'), // JSON array of product options
  
  // Analytics data (aggregated, non-encrypted)
  totalSold: integer('total_sold').default(0),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0.00'),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  reviewsCount: integer('reviews_count').default(0),
  
  // AI insights
  popularityScore: decimal('popularity_score', { precision: 3, scale: 2 }),
  trendingStatus: text('trending_status'), // trending, stable, declining
  seasonalPattern: json('seasonal_pattern'), // AI-detected seasonal data
  
  // Shopify timestamps
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  
  // System timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Shopify variant identifiers
  shopifyVariantId: text('shopify_variant_id').notNull(),
  sku: text('sku'),
  barcode: text('barcode'),
  
  // Variant details
  title: text('title').notNull(),
  option1: text('option1'), // e.g., "Red"
  option2: text('option2'), // e.g., "Large" 
  option3: text('option3'),
  
  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPerItem: decimal('cost_per_item', { precision: 10, scale: 2 }),
  
  // Inventory
  inventoryQuantity: integer('inventory_quantity').default(0),
  inventoryPolicy: text('inventory_policy').default('deny'), // deny, continue
  inventoryManagement: text('inventory_management'), // shopify, manual, etc.
  
  // Physical properties
  weight: decimal('weight', { precision: 8, scale: 3 }), // in grams
  weightUnit: text('weight_unit').default('g'),
  requiresShipping: boolean('requires_shipping').default(true),
  taxable: boolean('taxable').default(true),
  
  // Variant image
  imageId: text('image_id'),
  position: integer('position').default(1),
  
  // Analytics
  totalSold: integer('total_sold').default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0.00'),
  
  // Shopify timestamps
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  
  // System timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id').notNull().references(() => stores.id),
  
  // Shopify collection identifiers
  shopifyCollectionId: text('shopify_collection_id').notNull(),
  handle: text('handle').notNull(),
  
  // Collection details
  title: text('title').notNull(),
  description: text('description'),
  
  // Collection type and rules
  collectionType: text('collection_type').notNull(), // manual, smart
  rules: json('rules'), // For smart collections
  sortOrder: text('sort_order').default('manual'),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  
  // Collection image
  image: json('image'), // Image URL and alt text
  
  // Status
  isPublished: boolean('is_published').default(true),
  publishedAt: timestamp('published_at'),
  
  // Analytics
  productsCount: integer('products_count').default(0),
  viewsCount: integer('views_count').default(0),
  
  // Shopify timestamps
  shopifyCreatedAt: timestamp('shopify_created_at'),
  shopifyUpdatedAt: timestamp('shopify_updated_at'),
  
  // System timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productCollections = pgTable('product_collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  collectionId: uuid('collection_id').notNull().references(() => collections.id),
  position: integer('position').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  variants: many(productVariants),
  collections: many(productCollections),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [productVariants.storeId],
    references: [stores.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  store: one(stores, {
    fields: [collections.storeId],
    references: [stores.id],
  }),
  products: many(productCollections),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));
