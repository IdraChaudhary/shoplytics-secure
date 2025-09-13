interface DemoCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  accepts_marketing: boolean;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

interface DemoProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string;
  product_type: string;
  tags: string;
  images: Array<{ src: string; alt: string }>;
  options: Array<{ name: string; values: string[] }>;
  variants: Array<{
    id: string;
    title: string;
    option1: string;
    option2: string;
    price: string;
    inventory_quantity: number;
  }>;
}

interface DemoLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title: string;
  sku: string;
  vendor: string;
  product_type: string;
  quantity: number;
  price: string;
  total_discount: string;
  requires_shipping: boolean;
  taxable: boolean;
  grams: number;
}

interface DemoAddress {
  first_name: string;
  last_name: string;
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

interface DemoOrder {
  id: string;
  name: string;
  order_number: number;
  customer: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
  };
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  billing_address: DemoAddress;
  shipping_address: DemoAddress;
  line_items: DemoLineItem[];
  source_identifier: string;
  tags: string;
  created_at: string;
  updated_at: string;
  processed_at: string;
  store_id: string;
}

export type { DemoCustomer, DemoProduct, DemoLineItem, DemoAddress, DemoOrder };