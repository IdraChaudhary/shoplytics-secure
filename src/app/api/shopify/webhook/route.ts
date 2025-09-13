import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import crypto from 'crypto';
import { getDb } from '@/lib/database/connection';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { 
  tenants, 
  dashboardOrders, 
  dashboardCustomers, 
  dashboardProducts,
  webhookLogs 
} from '@/lib/database/schemas/tenants';
import { eq } from 'drizzle-orm';
import { ShopifyOrder, ShopifyCustomer, ShopifyProduct } from '@/types/dashboard';

// Verify Shopify webhook signature
function verifyWebhookSignature(data: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const generatedSignature = hmac.update(data, 'utf8').digest('base64');
  return crypto.timingSafeEqual(
    Uint8Array.from(Buffer.from(signature, 'utf8')),
    Uint8Array.from(Buffer.from(generatedSignature, 'utf8'))
  );
}

export async function POST(request: NextRequest) {
  // Prevent caching
  noStore();
  
  const db = getDb();
  const startTime = Date.now();
  let tenantId: number | null = null;
  let topic: string | null = null;

  try {
    const body = await request.text();
    const headersList = headers();
    
    const shopDomain = headersList.get('x-shopify-shop-domain');
    const webhookTopic = headersList.get('x-shopify-topic');
    const signature = headersList.get('x-shopify-hmac-sha256');
    
    topic = webhookTopic;

    if (!shopDomain || !webhookTopic || !signature) {
      return NextResponse.json(
        { error: 'Missing required Shopify headers' },
        { status: 400 }
      );
    }

    // Find tenant by shop domain
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.shopifyStoreUrl, shopDomain))
      .limit(1);

    if (!tenant.length) {
      return NextResponse.json(
        { error: 'Tenant not found for shop domain' },
        { status: 404 }
      );
    }

    tenantId = tenant[0].id;

    // Verify webhook signature
    if (tenant[0].webhookSecret) {
      const isValid = verifyWebhookSignature(body, signature, tenant[0].webhookSecret);
      if (!isValid) {
        await logWebhookError(tenantId, topic, null, 'Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    
    // Process webhook based on topic
    let processed = false;
    let error: string | null = null;

    try {
      switch (webhookTopic) {
        case 'orders/create':
        case 'orders/updated':
        case 'orders/paid':
          await processOrderWebhook(tenantId, payload as ShopifyOrder);
          processed = true;
          break;
        
        case 'customers/create':
        case 'customers/update':
          await processCustomerWebhook(tenantId, payload as ShopifyCustomer);
          processed = true;
          break;
        
        case 'products/create':
        case 'products/update':
          await processProductWebhook(tenantId, payload as ShopifyProduct);
          processed = true;
          break;
        
        default:
          console.log(`Unhandled webhook topic: ${webhookTopic}`);
          processed = true; // Mark as processed to avoid retries
      }
    } catch (processError) {
      error = processError instanceof Error ? processError.message : 'Processing failed';
      console.error('Webhook processing error:', processError);
    }

    // Log webhook
    await db.insert(webhookLogs).values({
      tenantId,
      topic: webhookTopic,
      shopifyId: payload.id?.toString(),
      payload,
      processed,
      error,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json({ 
      success: processed,
      message: processed ? 'Webhook processed successfully' : 'Webhook processing failed'
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    
    // Log error if we have tenant and topic info
    if (tenantId && topic) {
      await logWebhookError(
        tenantId, 
        topic, 
        null, 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processOrderWebhook(tenantId: number, order: ShopifyOrder) {
  const db = getDb();
  // Check if customer exists, create if not
  let customerId: number | null = null;
  
  if (order.customer) {
    const existingCustomer = await db
      .select()
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.shopifyCustomerId, order.customer.id.toString()))
      .limit(1);

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
      
      // Update customer data
      await db
        .update(dashboardCustomers)
        .set({
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
          totalSpent: order.customer.total_spent,
          ordersCount: order.customer.orders_count,
          state: order.customer.state,
          acceptsMarketing: order.customer.accepts_marketing,
          tags: order.customer.tags,
          shopifyUpdatedAt: new Date(order.customer.updated_at),
          updatedAt: new Date(),
        })
        .where(eq(dashboardCustomers.id, customerId));
    } else {
      // Create new customer
      const [newCustomer] = await db
        .insert(dashboardCustomers)
        .values({
          tenantId,
          shopifyCustomerId: order.customer.id.toString(),
          email: order.customer.email,
          firstName: order.customer.first_name,
          lastName: order.customer.last_name,
          phone: order.customer.phone,
          totalSpent: order.customer.total_spent,
          ordersCount: order.customer.orders_count,
          state: order.customer.state,
          acceptsMarketing: order.customer.accepts_marketing,
          tags: order.customer.tags,
          shopifyCreatedAt: new Date(order.customer.created_at),
          shopifyUpdatedAt: new Date(order.customer.updated_at),
        })
        .returning();
      
      customerId = newCustomer.id;
    }
  }

  // Upsert order
  const existingOrder = await db
    .select()
    .from(dashboardOrders)
    .where(eq(dashboardOrders.shopifyOrderId, order.id.toString()))
    .limit(1);

  const orderData = {
    tenantId,
    shopifyOrderId: order.id.toString(),
    customerId,
    orderNumber: order.order_number,
    email: order.email,
    totalPrice: order.total_price,
    subtotalPrice: order.subtotal_price,
    totalTax: order.total_tax,
    totalDiscounts: order.total_discounts,
    currency: order.currency,
    financialStatus: order.financial_status,
    fulfillmentStatus: order.fulfillment_status,
    orderDate: new Date(order.created_at),
    processedAt: order.processed_at ? new Date(order.processed_at) : null,
    lineItems: order.line_items,
    billingAddress: order.billing_address,
    shippingAddress: order.shipping_address,
    discountCodes: order.discount_codes,
    shopifyCreatedAt: new Date(order.created_at),
    shopifyUpdatedAt: new Date(order.updated_at),
    updatedAt: new Date(),
  };

  if (existingOrder.length > 0) {
    await db
      .update(dashboardOrders)
      .set(orderData)
      .where(eq(dashboardOrders.id, existingOrder[0].id));
  } else {
    await db.insert(dashboardOrders).values(orderData);
  }
}

async function processCustomerWebhook(tenantId: number, customer: ShopifyCustomer) {
  const db = getDb();
  const existingCustomer = await db
    .select()
    .from(dashboardCustomers)
    .where(eq(dashboardCustomers.shopifyCustomerId, customer.id.toString()))
    .limit(1);

  const customerData = {
    tenantId,
    shopifyCustomerId: customer.id.toString(),
    email: customer.email,
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.phone,
    totalSpent: customer.total_spent,
    ordersCount: customer.orders_count,
    state: customer.state,
    acceptsMarketing: customer.accepts_marketing,
    tags: customer.tags,
    shopifyCreatedAt: new Date(customer.created_at),
    shopifyUpdatedAt: new Date(customer.updated_at),
    updatedAt: new Date(),
  };

  if (existingCustomer.length > 0) {
    await db
      .update(dashboardCustomers)
      .set(customerData)
      .where(eq(dashboardCustomers.id, existingCustomer[0].id));
  } else {
    await db.insert(dashboardCustomers).values(customerData);
  }
}

async function processProductWebhook(tenantId: number, product: ShopifyProduct) {
  const db = getDb();
  const existingProduct = await db
    .select()
    .from(dashboardProducts)
    .where(eq(dashboardProducts.shopifyProductId, product.id.toString()))
    .limit(1);

  const productData = {
    tenantId,
    shopifyProductId: product.id.toString(),
    title: product.title,
    handle: product.handle,
    vendor: product.vendor,
    productType: product.product_type,
    status: product.status,
    tags: product.tags,
    variants: product.variants,
    images: product.images,
    shopifyCreatedAt: new Date(product.created_at),
    shopifyUpdatedAt: new Date(product.updated_at),
    updatedAt: new Date(),
  };

  if (existingProduct.length > 0) {
    await db
      .update(dashboardProducts)
      .set(productData)
      .where(eq(dashboardProducts.id, existingProduct[0].id));
  } else {
    await db.insert(dashboardProducts).values(productData);
  }
}

async function logWebhookError(tenantId: number, topic: string | null, shopifyId: string | null, error: string) {
  const db = getDb();
  try {
    await db.insert(webhookLogs).values({
      tenantId,
      topic: topic || 'unknown',
      shopifyId,
      payload: null,
      processed: false,
      error,
      processingTime: 0,
    });
  } catch (logError) {
    console.error('Failed to log webhook error:', logError);
  }
}
