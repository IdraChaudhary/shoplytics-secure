import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database/connection';
import { dashboardProducts } from '@/lib/database/schemas/tenants';
import { unstable_noStore as noStore } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import type { ShopifyProductWebhook, ShopifyProductVariant } from '@/types/webhooks';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';

// Helper for getting base price from variants
const getBasePrice = (variants: ShopifyProductVariant[] | undefined): string => {
  if (!variants || variants.length === 0) return '0.00';
  const prices = variants.map(v => parseFloat(v.price));
  return Math.min(...prices).toFixed(2);
};

// Helper for getting compare at price from variants
const getCompareAtPrice = (variants: ShopifyProductVariant[] | undefined): string | null => {
  if (!variants || variants.length === 0) return null;
  const compareAtPrices = variants
    .map(v => v.compare_at_price ? parseFloat(v.compare_at_price) : null)
    .filter((p): p is number => p !== null);
  return compareAtPrices.length > 0 ? Math.min(...compareAtPrices).toFixed(2) : null;
};

// Helper for number parsing
const parseIntSafe = (value: string | null | undefined, defaultValue = 0): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Simulate Shopify product webhook
export async function POST(request: NextRequest) {
  try {
    // Prevent caching
    noStore();
    
    const payload = await request.json() as ShopifyProductWebhook;
    
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

    // Check if product already exists
    const existingProduct = await db.select()
      .from(dashboardProducts)
      .where(and(
        eq(dashboardProducts.tenantId, tenantId),
        eq(dashboardProducts.shopifyProductId, payload.id.toString())
      ))
      .limit(1);

    let productId: number;

    if (existingProduct.length > 0) {
      // Update existing product
      productId = existingProduct[0].id;
      
      await db.update(dashboardProducts)
        .set({
          title: payload.title,
          handle: payload.handle,
          vendor: payload.vendor || 'Unknown',
          productType: payload.product_type || 'General',
          status: payload.status || 'active',
          tags: payload.tags || '',
          price: getBasePrice(payload.variants),
          compareAtPrice: getCompareAtPrice(payload.variants),
          variants: payload.variants || [],
          images: payload.images || [],
          shopifyUpdatedAt: new Date(payload.updated_at),
          updatedAt: new Date()
        })
        .where(eq(dashboardProducts.id, productId));
    } else {
      // Create new product
      const newProduct = await db.insert(dashboardProducts).values({
        tenantId,
        shopifyProductId: payload.id.toString(),
        handle: payload.handle,
        title: payload.title,
        vendor: payload.vendor || 'Unknown',
        productType: payload.product_type || 'General',
        status: payload.status || 'active',
        tags: payload.tags || '',
        price: getBasePrice(payload.variants),
        compareAtPrice: getCompareAtPrice(payload.variants),
        variants: payload.variants || [],
        images: payload.images || [],
        totalSales: '0.00',
        totalQuantitySold: 0,
        shopifyCreatedAt: new Date(payload.created_at),
        shopifyUpdatedAt: new Date(payload.updated_at)
      }).returning();
      
      productId = newProduct[0].id;
    }

    return NextResponse.json({
      success: true,
      message: 'Product processed successfully',
      productId,
      variantsCount: payload.variants?.length || 0,
    });

  } catch (error) {
    console.error('Error processing product webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process product webhook' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve products for a store
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

    const storeProducts = await db.select()
      .from(dashboardProducts)
      .where(eq(dashboardProducts.tenantId, tenantId))
      .limit(limit)
      .offset(offset)
      .orderBy(dashboardProducts.createdAt);

    return NextResponse.json({
      products: storeProducts,
      total: storeProducts.length,
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}