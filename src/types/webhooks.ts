export interface ShopifyCustomer {
  id: string | number;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  accepts_marketing?: boolean;
  email_verified?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ShopifyAddress {
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
}

export interface ShopifyLineItem {
  id: string | number;
  product_id?: string | number;
  variant_id?: string | number;
  title?: string;
  name?: string;
  variant_title?: string;
  sku?: string;
  vendor?: string;
  product_type?: string;
  quantity: number;
  price: string;
  total_discount?: string;
  requires_shipping?: boolean;
  taxable?: boolean;
  grams?: number;
}

export interface ShopifyShippingLine {
  price: string;
}

export interface ShopifyOrderWebhook {
  id: string | number;
  customer?: ShopifyCustomer;
  order_number?: string | number;
  name: string;
  total_price: string;
  subtotal_price?: string;
  total_tax?: string;
  total_discounts?: string;
  currency?: string;
  financial_status?: string;
  fulfillment_status?: string;
  closed_at?: string;
  tags?: string;
  note?: string;
  source_identifier?: string;
  referring_site?: string;
  landing_site?: string;
  processed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at?: string;
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  line_items?: ShopifyLineItem[];
  shipping_lines?: ShopifyShippingLine[];
  store_id?: string;
}