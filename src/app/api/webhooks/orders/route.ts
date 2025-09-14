import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database/connection';
import { dashboardOrders, dashboardCustomers, webhookLogs } from '@/lib/database/schemas/tenants';
import { unstable_noStore as noStore } from 'next/cache';
import { encryptData } from '@/lib/encryption/crypto';
import { eq, and } from 'drizzle-orm';
import type { ShopifyOrderWebhook, ShopifyShippingLine } from '@/types/webhooks';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';

// Helper for number parsing
const parseIntSafe = (value: string | null | undefined, defaultValue = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Simulate Shopify order webhook
export async function POST(request: NextRequest) {
  try {
    // Prevent caching
    noStore();
    
    const payload = await request.json() as ShopifyOrderWebhook;
    
    // Initialize database connection
    const db = getDb();
    
    // Extract tenant_id from headers
    const storeId = request.headers.get('x-store-id') || payload.store_id;
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const tenantId = parseIntSafe(storeId);
    if (tenantId === 0) {
      return NextResponse.json({ error: 'Invalid store ID format' }, { status: 400 });
    }

    // Get the store encryption key from headers
    const storeKey = request.headers.get('x-store-key');
    if (!storeKey) {
      return NextResponse.json({ error: 'Store encryption key required' }, { status: 400 });
    }

    // Log webhook receipt
    await db.insert(webhookLogs).values({
      tenantId,
      topic: 'orders/create',
      shopifyId: payload.id.toString(),
      payload: payload,
      processed: false
    });

    // Process customer data first
    let customerId: number | null = null;
    
    if (payload.customer) {
      // Check if customer already exists
      const existingCustomer = await db.select()
        .from(dashboardCustomers)
        .where(and(
          eq(dashboardCustomers.tenantId, tenantId),
          eq(dashboardCustomers.shopifyCustomerId, payload.customer.id.toString())
        ))
        .limit(1);

      if (existingCustomer.length > 0 && existingCustomer[0]) {
        const customer = existingCustomer[0];
        customerId = customer.id;
        
        // Update customer analytics
        await db.update(dashboardCustomers)
          .set({
            ordersCount: (customer.ordersCount || 0) + 1,
            totalSpent: (parseFloat(customer.totalSpent || '0') + parseFloat(payload.total_price)).toFixed(2),
            lastOrderDate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(dashboardCustomers.id, customerId));
      } else {
        // Create new customer
        const newCustomer = await db.insert(dashboardCustomers).values({
          tenantId,
          shopifyCustomerId: payload.customer.id.toString(),
          email: payload.customer.email ? encryptData(payload.customer.email, storeKey) : null,
          firstName: payload.customer.first_name ? encryptData(payload.customer.first_name, storeKey) : null,
          lastName: payload.customer.last_name ? encryptData(payload.customer.last_name, storeKey) : null,
          phone: payload.customer.phone ? encryptData(payload.customer.phone, storeKey) : null,
          ordersCount: 1,
          totalSpent: payload.total_price,
          state: 'enabled',
          acceptsMarketing: payload.customer.accepts_marketing || false,
          lastOrderDate: new Date(),
          shopifyCreatedAt: new Date(payload.customer.created_at),
          shopifyUpdatedAt: new Date(payload.customer.updated_at || payload.customer.created_at),
        }).returning();
        
        customerId = newCustomer[0].id;
      }
    }

    // Encrypt sensitive address data
    const encryptedBillingAddress = payload.billing_address ? 
      encryptData(JSON.stringify(payload.billing_address), storeKey) : null;
    const encryptedShippingAddress = payload.shipping_address ? 
      encryptData(JSON.stringify(payload.shipping_address), storeKey) : null;
    const encryptedCustomerEmail = payload.customer?.email ? 
      encryptData(payload.customer.email, storeKey) : null;

    // Create order record
    const newOrder = await db.insert(dashboardOrders).values({
      tenantId,
      customerId,
      shopifyOrderId: payload.id.toString(),
      orderNumber: payload.order_number?.toString() || payload.name,
      email: encryptedCustomerEmail,
      totalPrice: payload.total_price,
      subtotalPrice: payload.subtotal_price || payload.total_price,
      totalTax: payload.total_tax || '0.00',
      totalDiscounts: payload.total_discounts || '0.00',
      shippingPrice: payload.shipping_lines?.reduce((sum: number, line: ShopifyShippingLine) => 
        sum + parseFloat(line.price), 0).toFixed(2) || '0.00',
      currency: payload.currency || 'USD',
      financialStatus: payload.financial_status || 'pending',
      fulfillmentStatus: payload.fulfillment_status || 'unfulfilled',
      source: payload.source_identifier || 'web',
      orderDate: new Date(payload.created_at),
      processedAt: payload.processed_at ? new Date(payload.processed_at) : new Date(),
      cancelledAt: payload.cancelled_at ? new Date(payload.cancelled_at) : null,
      lineItems: payload.line_items || [],
      billingAddress: encryptedBillingAddress,
      shippingAddress: encryptedShippingAddress,
      discountCodes: [],
      shopifyCreatedAt: new Date(payload.created_at),
      shopifyUpdatedAt: new Date(payload.updated_at || payload.created_at)
    }).returning();

    // Update webhook log
    await db.update(webhookLogs)
      .set({
        processed: true,
        processingTime: Date.now() - new Date().getTime()
      })
      .where(and(
        eq(webhookLogs.tenantId, tenantId),
        eq(webhookLogs.shopifyId, payload.id.toString())
      ));

    // Update customer analytics if needed
    if (customerId) {
      // Calculate updated averages
      const customerOrders = await db.select()
        .from(dashboardOrders)
        .where(and(
          eq(dashboardOrders.customerId, customerId),
          eq(dashboardOrders.tenantId, tenantId)
        ));
      
      const totalSpent = customerOrders.reduce((sum, order) => 
        sum + parseFloat(order.totalPrice), 0);

      await db.update(dashboardCustomers)
        .set({
          totalSpent: totalSpent.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(dashboardCustomers.id, customerId));
    }

    return NextResponse.json({
      success: true,
      message: 'Order processed successfully',
      orderId: newOrder[0].id,
      customerId,
    });

  } catch (error: unknown) {
    console.error('Error processing order webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to process order webhook', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve orders for a store
export async function GET(request: NextRequest) {
  try {
    // Prevent caching
    noStore();
    
    const { searchParams } = new URL(request.url);
    
    // Initialize database connection
    const db = getDb();
    const storeId = searchParams.get('store_id');
    const limit = parseIntSafe(searchParams.get('limit'), 50);
    const offset = parseIntSafe(searchParams.get('offset'), 0);

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const tenantId = parseIntSafe(storeId);
    if (tenantId === 0) {
      return NextResponse.json({ error: 'Invalid store ID format' }, { status: 400 });
    }

    const storeOrders = await db.select()
      .from(dashboardOrders)
      .where(eq(dashboardOrders.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(dashboardOrders.createdAt);

    return NextResponse.json({
      orders: storeOrders,
      total: storeOrders.length,
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}