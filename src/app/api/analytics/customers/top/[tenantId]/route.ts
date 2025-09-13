import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getDb } from '@/lib/database/connection';
import { dashboardCustomers, tenants } from '@/lib/database/schemas/tenants';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { eq, desc, sql } from 'drizzle-orm';
import { TopCustomer } from '@/types/dashboard';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    // Prevent caching
    noStore();
    
    const db = getDb();
    const tenantId = parseInt(params.tenantId);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 50); // Max 50 customers

    // Validate tenant exists
    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant.length) {
      return NextResponse.json(
        { success: false, message: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Get top customers by total spent
    const topCustomersData = await db
      .select({
        id: dashboardCustomers.id,
        firstName: dashboardCustomers.firstName,
        lastName: dashboardCustomers.lastName,
        email: dashboardCustomers.email,
        totalSpent: dashboardCustomers.totalSpent,
        ordersCount: dashboardCustomers.ordersCount,
        lastOrderDate: dashboardCustomers.lastOrderDate,
      })
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.tenantId, tenantId))
      .orderBy(desc(dashboardCustomers.totalSpent))
      .limit(limit);

    // Transform data for frontend
    const topCustomers: TopCustomer[] = topCustomersData.map((customer) => ({
      id: customer.id,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown Customer',
      email: customer.email || '',
      totalSpent: parseFloat(customer.totalSpent || '0'),
      ordersCount: customer.ordersCount || 0,
      lastOrderDate: customer.lastOrderDate ? customer.lastOrderDate.toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      data: topCustomers,
    });
  } catch (error) {
    console.error('Top customers analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch top customers',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
