// Dashboard-specific types
export interface DashboardOverview {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface OrdersByDateData {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopCustomer {
  id: number;
  name: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string | null;
}

export interface ProductPerformance {
  id: number;
  title: string;
  totalSales: number;
  totalQuantitySold: number;
  averagePrice: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

// Shopify webhook types
export interface ShopifyWebhookPayload {
  topic: string;
  shop_domain: string;
  payload: any;
}

export interface ShopifyOrder {
  id: number;
  order_number: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  processed_at: string;
  customer: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  billing_address: ShopifyAddress;
  shipping_address: ShopifyAddress;
  discount_codes: ShopifyDiscountCode[];
}

export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  total_spent: string;
  orders_count: number;
  state: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  tags: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  status: string;
  tags: string;
  created_at: string;
  updated_at: string;
  variants: ShopifyProductVariant[];
  images: ShopifyProductImage[];
}

export interface ShopifyProductVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string;
  sku: string;
  inventory_quantity: number;
}

export interface ShopifyProductImage {
  id: number;
  product_id: number;
  src: string;
  alt: string;
  position: number;
}

export interface ShopifyLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  vendor: string;
}

export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export interface ShopifyDiscountCode {
  code: string;
  amount: string;
  type: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardFilters {
  dateRange: DateRange;
  tenantId: number;
}

// Tenant management types
export interface TenantRegistration {
  name: string;
  shopifyStoreUrl: string;
  shopifyAccessToken: string;
  webhookSecret?: string;
}

export interface TenantSettings {
  name: string;
  webhookSecret?: string;
  settings?: Record<string, any>;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'area';
  dataKey: string;
  color: string;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}
