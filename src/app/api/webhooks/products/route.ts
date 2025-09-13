import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { products, productVariants } from '@/lib/database/schemas';
import { eq, and } from 'drizzle-orm';
import type { InsertProduct, InsertProductVariant } from '@/types/database';

// Simulate Shopify product webhook
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    // Extract tenant_id from headers
    const storeId = request.headers.get('x-store-id') || payload.store_id;
    
    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Check if product already exists
    const existingProduct = await db.select()
      .from(products)
      .where(and(
        eq(products.storeId, storeId),
        eq(products.shopifyProductId, payload.id.toString())
      ))
      .limit(1);

    let productId: string;

    if (existingProduct.length > 0) {
      // Update existing product
      productId = existingProduct[0].id;
      
      await db.update(products)
        .set({
          title: payload.title,
          description: payload.body_html || payload.description,
          vendor: payload.vendor,
          productType: payload.product_type,
          status: payload.status || 'active',
          publishedAt: payload.published_at ? new Date(payload.published_at) : null,
          isPublished: payload.status === 'active' && payload.published_at,
          seoTitle: payload.seo_title,
          seoDescription: payload.seo_description,
          tags: payload.tags ? payload.tags.split(',').map((tag: string) => tag.trim()) : [],
          images: payload.images || [],
          featuredImage: payload.image?.src || payload.images?.[0]?.src,
          options: payload.options || [],
          shopifyUpdatedAt: new Date(payload.updated_at),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    } else {
      // Create new product
      const productData: InsertProduct = {
        storeId,
        shopifyProductId: payload.id.toString(),
        handle: payload.handle,
        title: payload.title,
        description: payload.body_html || payload.description,
        vendor: payload.vendor || 'Unknown',
        productType: payload.product_type || 'General',
        status: payload.status || 'active',
        publishedAt: payload.published_at ? new Date(payload.published_at) : new Date(),
        isPublished: payload.status === 'active',
        seoTitle: payload.seo_title,
        seoDescription: payload.seo_description,
        tags: payload.tags ? payload.tags.split(',').map((tag: string) => tag.trim()) : [],
        images: payload.images || [],
        featuredImage: payload.image?.src || payload.images?.[0]?.src,
        options: payload.options || [],
        totalSold: 0,
        totalRevenue: '0.00',
        reviewsCount: 0,
        // Mock AI insights
        popularityScore: (Math.random() * 5).toString(),
        trendingStatus: Math.random() > 0.7 ? 'trending' : 'stable',
        shopifyCreatedAt: new Date(payload.created_at),
        shopifyUpdatedAt: new Date(payload.updated_at || payload.created_at),
      };
      
      const newProduct = await db.insert(products).values(productData).returning();

      productId = newProduct[0].id;
    }

    // Process product variants
    if (payload.variants && payload.variants.length > 0) {
      // Delete existing variants for update
      if (existingProduct.length > 0) {
        await db.delete(productVariants)
          .where(eq(productVariants.productId, productId));
      }

      const variantsData: InsertProductVariant[] = payload.variants.map((variant: any) => ({
        productId,
        storeId,
        shopifyVariantId: variant.id.toString(),
        sku: variant.sku,
        barcode: variant.barcode,
        title: variant.title,
        option1: variant.option1,
        option2: variant.option2,
        option3: variant.option3,
        price: variant.price,
        compareAtPrice: variant.compare_at_price || null,
        costPerItem: variant.cost || null,
        inventoryQuantity: variant.inventory_quantity || 0,
        inventoryPolicy: variant.inventory_policy || 'deny',
        inventoryManagement: variant.inventory_management || 'shopify',
        weight: variant.weight ? variant.weight.toString() : null,
        weightUnit: variant.weight_unit || 'g',
        requiresShipping: variant.requires_shipping !== false,
        taxable: variant.taxable !== false,
        imageId: variant.image_id?.toString(),
        position: variant.position || 1,
        totalSold: 0,
        revenue: '0.00',
        shopifyCreatedAt: new Date(variant.created_at),
        shopifyUpdatedAt: new Date(variant.updated_at || variant.created_at),
      }));

      await db.insert(productVariants).values(variantsData);
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
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('store_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    const storeProducts = await db.select()
      .from(products)
      .where(eq(products.storeId, storeId))
      .limit(limit)
      .offset(offset)
      .orderBy(products.createdAt);

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
