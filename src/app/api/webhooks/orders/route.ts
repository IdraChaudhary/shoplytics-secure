import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { orders, orderLineItems, customers, orderEvents } from '@/lib/database/schemas';
import { encryptData } from '@/lib/encryption/crypto';
import { eq, and } from 'drizzle-orm';
import type { ShopifyOrderWebhook, ShopifyShippingLine } from '@/types/webhooks';
import type { InsertCustomer, InsertOrder, InsertOrderLineItem, InsertOrderEvent } from '@/types/database';

// Simulate Shopify order webhook
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as ShopifyOrderWebhook;
    
    // Extract tenant_id from headers (in real Shopify, this would be from webhook URL or verification)
    const storeId = request.headers.get('x-store-id') || payload.store_id;
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Get encryption key for the store (simplified for demo)
    const storeKey = process.env.DEMO_ENCRYPTION_KEY || 'demo-key-for-development';

    // Process customer data first
    let customerId: string | null = null;
    
    if (payload.customer) {
      // Check if customer already exists
      const existingCustomer = await db.select()
        .from(customers)
        .where(and(
          eq(customers.storeId, storeId),
          eq(customers.shopifyCustomerId, payload.customer.id.toString())
        ))
        .limit(1);

      if (existingCustomer.length > 0 && existingCustomer[0]) {
        const customer = existingCustomer[0];
        customerId = customer.id;
        
        // Update customer analytics
        await db.update(customers)
          .set({
            totalOrders: (customer.totalOrders || 0) + 1,
            totalSpent: (parseFloat(customer.totalSpent || '0') + parseFloat(payload.total_price)).toFixed(2),
            lastOrderAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(customers.id, customerId));
      } else {
        // Create new customer with encrypted PII
        const customerData: InsertCustomer = {
          storeId,
          shopifyCustomerId: payload.customer.id.toString(),
          email: payload.customer.email ? encryptData(payload.customer.email, storeKey) : null,
          firstName: payload.customer.first_name ? encryptData(payload.customer.first_name, storeKey) : null,
          lastName: payload.customer.last_name ? encryptData(payload.customer.last_name, storeKey) : null,
          phone: payload.customer.phone ? encryptData(payload.customer.phone, storeKey) : null,
          acceptsMarketing: payload.customer.accepts_marketing || false,
          emailVerified: payload.customer.email_verified || false,
          totalOrders: 1,
          totalSpent: payload.total_price,
          averageOrderValue: payload.total_price,
          firstOrderAt: new Date(),
          lastOrderAt: new Date(),
          customerLifetimeValue: payload.total_price,
          // AI-powered insights (mock for demo)
          churnRiskScore: (Math.random() * 0.5).toString(), // Random score between 0-0.5 for new customers
          segmentTag: 'new',
          dataProcessingConsent: true,
          consentGivenAt: new Date(),
          shopifyCreatedAt: new Date(payload.customer.created_at),
          shopifyUpdatedAt: new Date(payload.customer.updated_at || payload.customer.created_at),
        };
        
        const newCustomer = await db.insert(customers).values(customerData).returning();
        
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
    const orderData: InsertOrder = {
      storeId,
      customerId,
      shopifyOrderId: payload.id.toString(),
      orderNumber: payload.order_number?.toString() || payload.name,
      name: payload.name,
      totalPrice: payload.total_price,
      subtotalPrice: payload.subtotal_price || payload.total_price,
      totalTax: payload.total_tax || '0.00',
      totalDiscounts: payload.total_discounts || '0.00',
      totalShipping: payload.shipping_lines?.reduce((sum: number, line: ShopifyShippingLine) => sum + parseFloat(line.price), 0).toFixed(2) || '0.00',
      currency: payload.currency || 'USD',
      financialStatus: payload.financial_status || 'pending',
      fulfillmentStatus: payload.fulfillment_status || 'unfulfilled',
      orderStatus: payload.closed_at ? 'closed' : 'open',
      customerEmail: encryptedCustomerEmail,
      billingAddress: encryptedBillingAddress,
      shippingAddress: encryptedShippingAddress,
      tags: payload.tags?.split(',') || [],
      note: payload.note ? encryptData(payload.note, storeKey) : null,
      sourceIdentifier: payload.source_identifier || 'web',
      referringSite: payload.referring_site,
      landingSite: payload.landing_site,
      processedAt: payload.processed_at ? new Date(payload.processed_at) : new Date(),
      cancelledAt: payload.cancelled_at ? new Date(payload.cancelled_at) : null,
      closedAt: payload.closed_at ? new Date(payload.closed_at) : null,
      cancelReason: payload.cancel_reason,
      lineItemsCount: payload.line_items?.length || 0,
      uniqueProductsCount: payload.line_items ? new Set(payload.line_items.map(item => item.product_id?.toString())).size : 0,
      // AI insights (mock for demo)
      riskScore: (Math.random() * 0.3).toString(), // Random fraud risk score
      customerSegment: customerId ? 'returning' : 'new',
      orderPattern: 'regular',
      shopifyCreatedAt: new Date(payload.created_at),
      shopifyUpdatedAt: new Date(payload.updated_at || payload.created_at),
    };

    const newOrder = await db.insert(orders).values(orderData).returning();

    // Process line items
    if (payload.line_items && payload.line_items.length > 0) {
      const lineItemsData = payload.line_items.map((item: any) => ({
        orderId: newOrder[0].id,
        storeId,
        shopifyLineItemId: item.id.toString(),
        productId: item.product_id?.toString(),
        variantId: item.variant_id?.toString(),
        productTitle: item.title || item.name,
        variantTitle: item.variant_title,
        sku: item.sku,
        vendor: item.vendor,
        productType: item.product_type,
        quantity: item.quantity,
        price: item.price,
        totalDiscount: item.total_discount || '0.00',
        requiresShipping: item.requires_shipping !== false,
        taxable: item.taxable !== false,
        grams: item.grams,
      }));

      await db.insert(orderLineItems).values(lineItemsData);
    }

    // Create order event
    await db.insert(orderEvents).values({
      orderId: newOrder[0].id,
      storeId,
      eventType: 'created',
      eventData: {
        source: 'webhook',
        webhook_topic: 'orders/create',
      },
      message: `Order ${payload.name} created`,
      occurredAt: new Date(),
    });

    // Update customer analytics if needed
    if (customerId) {
      // Calculate updated averages
      const customerOrders = await db.select()
        .from(orders)
        .where(and(eq(orders.customerId, customerId), eq(orders.storeId, storeId)));
      
      const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
      const averageOrderValue = totalSpent / customerOrders.length;

      await db.update(customers)
        .set({
          averageOrderValue: averageOrderValue.toFixed(2),
          customerLifetimeValue: totalSpent.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));
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
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const storeOrders = await db.select()
      .from(orders)
      .where(eq(orders.storeId, storeId))
      .limit(limit)
      .offset(offset)
      .orderBy(orders.createdAt);

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
