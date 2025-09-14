import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';

export const GET = withAuth(async (req: NextRequest, tenant: any) => {
  return NextResponse.json({
    success: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      shopDomain: tenant.shopDomain,
      hasShopifyIntegration: tenant.hasShopifyIntegration
    }
  });
});
