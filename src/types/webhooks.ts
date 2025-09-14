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

export interface ShopifyRefund {
  id: string | number;
  order_id: string | number;
  created_at: string;
  note?: string;
  amount: string;
  currency: string;
  refund_line_items?: Array<{
    id: string | number;
    quantity: number;
    line_item_id: string | number;
    amount: string;
  }>;
  transactions?: Array<{
    id: string | number;
    amount: string;
    kind: string;
    status: string;
  }>;
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
  total_shipping?: string;
  currency?: string;
  financial_status?: string;
  fulfillment_status?: string;
  closed_at?: string;
  tags?: string;
  note?: string;
  source_identifier?: string;
  source_name?: string;
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
  order_status_url?: string;
  gateway?: string;
  confirmed?: boolean;
  contact_email?: string;
  order_status?: string;
  payment_gateway_names?: string[];
  refunds?: ShopifyRefund[];
}

export interface ShopifyProductImage {
  id: string | number;
  src: string;
  position?: number;
  width?: number;
  height?: number;
  alt?: string;
}

export interface ShopifyProductOption {
  id: string | number;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyProductVariant {
  id: string | number;
  product_id: string | number;
  title: string;
  sku?: string;
  barcode?: string;
  price: string;
  compare_at_price?: string | null;
  cost?: string | null;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  weight?: number;
  weight_unit?: string;
  inventory_quantity: number;
  inventory_policy?: string;
  inventory_management?: string;
  requires_shipping?: boolean;
  taxable?: boolean;
  image_id?: string | number;
  position?: number;
  created_at: string;
  updated_at?: string;
}

export interface ShopifyProductWebhook {
  id: string | number;
  title: string;
  body_html?: string;
  description?: string;
  vendor?: string;
  product_type?: string;
  handle: string;
  status?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string;
  images?: ShopifyProductImage[];
  image?: ShopifyProductImage;
  options?: ShopifyProductOption[];
  variants?: ShopifyProductVariant[];
  store_id?: string;
}