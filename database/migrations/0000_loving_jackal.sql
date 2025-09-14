CREATE TABLE IF NOT EXISTS "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"trigger_data" json,
	"thresholds" json,
	"affected_resources" json,
	"status" text DEFAULT 'ACTIVE',
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp,
	"resolved_by" uuid,
	"resolved_at" timestamp,
	"resolution" text,
	"notifications_sent" json,
	"last_notification_at" timestamp,
	"confidence_score" text,
	"false_positive" text,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"user_id" uuid,
	"store_id" uuid,
	"actor_type" text NOT NULL,
	"actor_id" text,
	"description" text NOT NULL,
	"metadata" json,
	"before_data" json,
	"after_data" json,
	"ip_address" "inet",
	"user_agent" text,
	"request_id" text,
	"session_id" text,
	"gdpr_relevant" text,
	"data_classification" text,
	"severity" text DEFAULT 'MEDIUM',
	"status" text NOT NULL,
	"error_message" text,
	"occurred_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"store_id" uuid NOT NULL,
	"version" text NOT NULL,
	"previous_version" text,
	"data_snapshot" json NOT NULL,
	"changes_summary" json,
	"changed_by" uuid,
	"change_reason" text,
	"audit_log_id" uuid,
	"is_active" text DEFAULT 'true',
	"retention_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_segment_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"segment_id" uuid NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"criteria" json NOT NULL,
	"customer_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"shopify_customer_id" text NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"accepts_marketing" boolean DEFAULT false,
	"marketing_opt_in_level" text,
	"email_verified" boolean DEFAULT false,
	"default_address_data" json,
	"total_orders" integer DEFAULT 0,
	"total_spent" numeric(10, 2) DEFAULT '0.00',
	"average_order_value" numeric(10, 2) DEFAULT '0.00',
	"first_order_at" timestamp,
	"last_order_at" timestamp,
	"customer_lifetime_value" numeric(10, 2) DEFAULT '0.00',
	"churn_risk_score" numeric(3, 2),
	"segment_tag" text,
	"predicted_next_purchase_date" timestamp,
	"data_processing_consent" boolean DEFAULT false,
	"consent_given_at" timestamp,
	"consent_withdrawn_at" timestamp,
	"gdpr_data_request" text,
	"data_retention_expires_at" timestamp,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"tags" text[],
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_store_access" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"role" text NOT NULL,
	"permissions" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"granted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"role" text DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"password_reset_token" text,
	"password_reset_expires_at" timestamp,
	"default_store_id" uuid,
	"data_retention_days" integer DEFAULT 365,
	"consent_given" boolean DEFAULT false NOT NULL,
	"consent_given_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "encryption_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"key_version" integer NOT NULL,
	"encrypted_key" text NOT NULL,
	"algorithm" text DEFAULT 'AES-256-GCM' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"rotated_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shopify_domain" text NOT NULL,
	"shopify_access_token" text,
	"shopify_webhook_secret" text,
	"store_name" text NOT NULL,
	"store_email" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"country" text,
	"shopify_plan" text,
	"webhook_endpoint_verified" boolean DEFAULT false,
	"last_sync_at" timestamp,
	"sync_status" text DEFAULT 'initial' NOT NULL,
	"sync_errors" json,
	"data_retention_days" integer DEFAULT 730,
	"gdpr_compliant" boolean DEFAULT false NOT NULL,
	"ccpa_compliant" boolean DEFAULT false NOT NULL,
	"encryption_enabled" boolean DEFAULT true NOT NULL,
	"ai_insights_enabled" boolean DEFAULT true NOT NULL,
	"alerts_enabled" boolean DEFAULT true NOT NULL,
	"custom_dashboard_config" json,
	"subscription_tier" text DEFAULT 'starter' NOT NULL,
	"subscription_status" text DEFAULT 'trialing' NOT NULL,
	"trial_ends_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "stores_shopify_domain_unique" UNIQUE("shopify_domain")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"event_data" json,
	"message" text,
	"occurred_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"shopify_line_item_id" text NOT NULL,
	"product_id" text,
	"variant_id" text,
	"product_title" text,
	"variant_title" text,
	"sku" text,
	"vendor" text,
	"product_type" text,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"total_discount" numeric(10, 2) DEFAULT '0.00',
	"requires_shipping" boolean DEFAULT true,
	"taxable" boolean DEFAULT true,
	"grams" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"customer_id" uuid,
	"shopify_order_id" text NOT NULL,
	"order_number" text NOT NULL,
	"name" text,
	"total_price" numeric(10, 2) NOT NULL,
	"subtotal_price" numeric(10, 2),
	"total_tax" numeric(10, 2),
	"total_discounts" numeric(10, 2),
	"total_shipping" numeric(10, 2),
	"currency" text NOT NULL,
	"financial_status" text,
	"fulfillment_status" text,
	"order_status" text,
	"customer_email" text,
	"billing_address" json,
	"shipping_address" json,
	"tags" text[],
	"note" text,
	"source_identifier" text,
	"referring_site" text,
	"landing_site" text,
	"processed_at" timestamp,
	"cancelled_at" timestamp,
	"closed_at" timestamp,
	"cancel_reason" text,
	"line_items_count" integer DEFAULT 0,
	"unique_products_count" integer DEFAULT 0,
	"risk_score" numeric(3, 2),
	"customer_segment" text,
	"order_pattern" text,
	"shopify_created_at" timestamp NOT NULL,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"shopify_collection_id" text NOT NULL,
	"handle" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"collection_type" text NOT NULL,
	"rules" json,
	"sort_order" text DEFAULT 'manual',
	"seo_title" text,
	"seo_description" text,
	"image" json,
	"is_published" boolean DEFAULT true,
	"published_at" timestamp,
	"products_count" integer DEFAULT 0,
	"views_count" integer DEFAULT 0,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	"position" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"shopify_variant_id" text NOT NULL,
	"sku" text,
	"barcode" text,
	"title" text NOT NULL,
	"option1" text,
	"option2" text,
	"option3" text,
	"price" numeric(10, 2) NOT NULL,
	"compare_at_price" numeric(10, 2),
	"cost_per_item" numeric(10, 2),
	"inventory_quantity" integer DEFAULT 0,
	"inventory_policy" text DEFAULT 'deny',
	"inventory_management" text,
	"weight" numeric(8, 3),
	"weight_unit" text DEFAULT 'g',
	"requires_shipping" boolean DEFAULT true,
	"taxable" boolean DEFAULT true,
	"image_id" text,
	"position" integer DEFAULT 1,
	"total_sold" integer DEFAULT 0,
	"revenue" numeric(10, 2) DEFAULT '0.00',
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_id" uuid NOT NULL,
	"shopify_product_id" text NOT NULL,
	"handle" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"vendor" text,
	"product_type" text,
	"status" text DEFAULT 'active' NOT NULL,
	"published_at" timestamp,
	"is_published" boolean DEFAULT true,
	"seo_title" text,
	"seo_description" text,
	"tags" text[],
	"images" json,
	"featured_image" text,
	"options" json,
	"total_sold" integer DEFAULT 0,
	"total_revenue" numeric(10, 2) DEFAULT '0.00',
	"average_rating" numeric(3, 2),
	"reviews_count" integer DEFAULT 0,
	"popularity_score" numeric(3, 2),
	"trending_status" text,
	"seasonal_pattern" json,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"data" json NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"shopify_customer_id" varchar(100) NOT NULL,
	"email" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(50),
	"total_spent" numeric(10, 2) DEFAULT '0.00',
	"orders_count" integer DEFAULT 0,
	"state" varchar(50) DEFAULT 'enabled',
	"accepts_marketing" boolean DEFAULT false,
	"tags" text,
	"last_order_date" timestamp,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"shopify_order_id" varchar(100) NOT NULL,
	"customer_id" integer,
	"order_number" varchar(100),
	"email" varchar(255),
	"total_price" numeric(10, 2) NOT NULL,
	"subtotal_price" numeric(10, 2),
	"total_tax" numeric(10, 2),
	"total_discounts" numeric(10, 2) DEFAULT '0.00',
	"shipping_price" numeric(10, 2) DEFAULT '0.00',
	"currency" varchar(3) DEFAULT 'USD',
	"financial_status" varchar(50),
	"fulfillment_status" varchar(50),
	"source" varchar(100),
	"order_date" timestamp NOT NULL,
	"processed_at" timestamp,
	"cancelled_at" timestamp,
	"line_items" json,
	"billing_address" json,
	"shipping_address" json,
	"discount_codes" json,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"shopify_product_id" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"handle" varchar(255),
	"vendor" varchar(255),
	"product_type" varchar(255),
	"status" varchar(50) DEFAULT 'active',
	"tags" text,
	"price" numeric(10, 2),
	"compare_at_price" numeric(10, 2),
	"variants" json,
	"images" json,
	"total_sales" numeric(10, 2) DEFAULT '0.00',
	"total_quantity_sold" integer DEFAULT 0,
	"shopify_created_at" timestamp,
	"shopify_updated_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"shopify_store_url" varchar(255) NOT NULL,
	"api_key" varchar(255) NOT NULL,
	"shopify_access_token" text,
	"webhook_secret" varchar(255),
	"is_active" boolean DEFAULT true,
	"settings" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_shopify_store_url_unique" UNIQUE("shopify_store_url"),
	CONSTRAINT "tenants_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer,
	"topic" varchar(100) NOT NULL,
	"shopify_id" varchar(100),
	"payload" json,
	"processed" boolean DEFAULT false,
	"error" text,
	"processing_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_cache_tenant_key_idx" ON "analytics_cache" ("tenant_id","cache_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "analytics_cache_expires_at_idx" ON "analytics_cache" ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_customers_tenant_shopify_id_idx" ON "dashboard_customers" ("tenant_id","shopify_customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_customers_tenant_email_idx" ON "dashboard_customers" ("tenant_id","email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_customers_total_spent_idx" ON "dashboard_customers" ("total_spent");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_customers_last_order_date_idx" ON "dashboard_customers" ("last_order_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_tenant_shopify_id_idx" ON "dashboard_orders" ("tenant_id","shopify_order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_tenant_date_idx" ON "dashboard_orders" ("tenant_id","order_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_customer_idx" ON "dashboard_orders" ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_total_price_idx" ON "dashboard_orders" ("total_price");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_financial_status_idx" ON "dashboard_orders" ("financial_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_orders_date_idx" ON "dashboard_orders" ("order_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_products_tenant_shopify_id_idx" ON "dashboard_products" ("tenant_id","shopify_product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_products_tenant_title_idx" ON "dashboard_products" ("tenant_id","title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_products_status_idx" ON "dashboard_products" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dashboard_products_total_sales_idx" ON "dashboard_products" ("total_sales");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_api_key_idx" ON "tenants" ("api_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tenants_store_url_idx" ON "tenants" ("shopify_store_url");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_logs_tenant_topic_idx" ON "webhook_logs" ("tenant_id","topic");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_logs_processed_idx" ON "webhook_logs" ("processed");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "webhook_logs_created_at_idx" ON "webhook_logs" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_versions" ADD CONSTRAINT "data_versions_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_versions" ADD CONSTRAINT "data_versions_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_versions" ADD CONSTRAINT "data_versions_audit_log_id_audit_logs_id_fk" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_segment_membership" ADD CONSTRAINT "customer_segment_membership_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_segment_membership" ADD CONSTRAINT "customer_segment_membership_segment_id_customer_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "customer_segments"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer_segments" ADD CONSTRAINT "customer_segments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_store_access" ADD CONSTRAINT "user_store_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_store_access" ADD CONSTRAINT "user_store_access_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_store_access" ADD CONSTRAINT "user_store_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "encryption_keys" ADD CONSTRAINT "encryption_keys_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_events" ADD CONSTRAINT "order_events_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_line_items" ADD CONSTRAINT "order_line_items_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collections" ADD CONSTRAINT "collections_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analytics_cache" ADD CONSTRAINT "analytics_cache_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_customers" ADD CONSTRAINT "dashboard_customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_orders" ADD CONSTRAINT "dashboard_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_orders" ADD CONSTRAINT "dashboard_orders_customer_id_dashboard_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "dashboard_customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_products" ADD CONSTRAINT "dashboard_products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
