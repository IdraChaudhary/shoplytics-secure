import { NextRequest, NextResponse } from 'next/server';
import { withAuth, authService } from '@/lib/auth';
import { z } from 'zod';

// Settings update schema
const settingsSchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  shopDomain: z.string().optional(),
  shopifyAccessToken: z.string().optional(),
}).refine((data) => {
  // If one Shopify field is provided, both must be provided
  if (data.shopDomain || data.shopifyAccessToken) {
    return data.shopDomain && data.shopifyAccessToken;
  }
  return true;
}, {
  message: 'Both shop domain and access token must be provided together',
});

// Get tenant settings
export const GET = withAuth(async (req: NextRequest, tenant: any) => {
  try {
    return NextResponse.json({
      success: true,
      settings: {
        id: tenant.id,
        name: tenant.name,
        email: tenant.email,
        shopDomain: tenant.shopDomain,
        hasShopifyIntegration: tenant.hasShopifyIntegration,
        apiKey: tenant.apiKey,
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
});

// Update tenant settings
export const PUT = withAuth(async (req: NextRequest, tenant: any) => {
  try {
    const body = await req.json();
    
    // Validate request body
    const validation = settingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, shopDomain, shopifyAccessToken } = validation.data;
    const updateData: any = {};

    // Update name if provided
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update Shopify integration if provided
    if (shopDomain && shopifyAccessToken) {
      // Validate Shopify credentials
      try {
        const { createShopifyClient } = await import('@/services/shopify/client');
        const client = createShopifyClient({
          shopDomain,
          accessToken: shopifyAccessToken
        });

        const isHealthy = await client.healthCheck();
        if (!isHealthy) {
          return NextResponse.json(
            { error: 'Unable to connect to Shopify store. Please check your credentials.' },
            { status: 400 }
          );
        }

        updateData.shopDomain = shopDomain;
        updateData.shopifyAccessToken = shopifyAccessToken;
      } catch (error) {
        console.error('Shopify validation error:', error);
        return NextResponse.json(
          { error: 'Failed to validate Shopify credentials' },
          { status: 400 }
        );
      }
    } else if (shopDomain === '' && shopifyAccessToken === '') {
      // Remove Shopify integration
      updateData.shopDomain = null;
      updateData.shopifyAccessToken = null;
    }

    // Update tenant in database
    const updatedTenant = await authService.prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        shopDomain: true,
        shopifyAccessToken: true,
        apiKey: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        ...updatedTenant,
        hasShopifyIntegration: !!updatedTenant.shopifyAccessToken
      }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
