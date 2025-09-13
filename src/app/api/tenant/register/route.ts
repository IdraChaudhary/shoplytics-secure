import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getDb } from '@/lib/database/connection';
import { tenants } from '@/lib/database/schemas/tenants';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { eq } from 'drizzle-orm';
import { TenantRegistration } from '@/types/dashboard';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Prevent caching
    noStore();
    
    const db = getDb();
    const body: TenantRegistration = await request.json();

    // Validate required fields
    if (!body.name || !body.shopifyStoreUrl || !body.shopifyAccessToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields: name, shopifyStoreUrl, shopifyAccessToken' 
        },
        { status: 400 }
      );
    }

    // Validate Shopify store URL format
    const storeUrlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
    if (!storeUrlRegex.test(body.shopifyStoreUrl)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid Shopify store URL format. Should be like: mystore.myshopify.com' 
        },
        { status: 400 }
      );
    }

    // Check if tenant already exists
    const existingTenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.shopifyStoreUrl, body.shopifyStoreUrl))
      .limit(1);

    if (existingTenant.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tenant with this Shopify store URL already exists' 
        },
        { status: 409 }
      );
    }

    // Generate unique API key for the tenant
    const apiKey = generateApiKey();

    // TODO: In production, encrypt the Shopify access token before storing
    const encryptedAccessToken = body.shopifyAccessToken; // This should be encrypted

    // Create new tenant
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name: body.name,
        shopifyStoreUrl: body.shopifyStoreUrl,
        apiKey,
        shopifyAccessToken: encryptedAccessToken,
        webhookSecret: body.webhookSecret || generateWebhookSecret(),
        isActive: true,
        settings: {},
      })
      .returning();

    // TODO: Set up Shopify webhooks programmatically
    // This would involve calling Shopify Admin API to create webhooks

    return NextResponse.json({
      success: true,
      data: {
        id: newTenant.id,
        name: newTenant.name,
        shopifyStoreUrl: newTenant.shopifyStoreUrl,
        apiKey: newTenant.apiKey,
        webhookSecret: newTenant.webhookSecret,
        createdAt: newTenant.createdAt,
      },
      message: 'Tenant registered successfully. Please configure your Shopify webhooks.',
    });
  } catch (error) {
    console.error('Tenant registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to register tenant',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

function generateApiKey(): string {
  return `sk_${crypto.randomBytes(24).toString('hex')}`;
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// GET endpoint to retrieve tenant information
export async function GET(request: NextRequest) {
  try {
    // Prevent caching
    noStore();
    
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'API key is required' },
        { status: 400 }
      );
    }

    const tenant = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        shopifyStoreUrl: tenants.shopifyStoreUrl,
        isActive: tenants.isActive,
        createdAt: tenants.createdAt,
      })
      .from(tenants)
      .where(eq(tenants.apiKey, apiKey))
      .limit(1);

    if (!tenant.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant[0],
    });
  } catch (error) {
    console.error('Tenant lookup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve tenant information',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
