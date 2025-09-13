import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getDb } from '@/lib/database/connection';
import { dashboardOrders, dashboardCustomers, tenants } from '@/lib/database/schemas/tenants';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { DashboardOverview } from '@/types/dashboard';

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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

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

    // Build date filters
    const dateFilters = [];
    if (from) {
      dateFilters.push(gte(dashboardOrders.orderDate, new Date(from)));
    }
    if (to) {
      dateFilters.push(lte(dashboardOrders.orderDate, new Date(to)));
    }

    // Get current period stats
    const currentStats = await db
      .select({
        totalOrders: sql<number>`count(${dashboardOrders.id})`,
        totalRevenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}), 0)`,
        totalCustomers: sql<number>`count(distinct ${dashboardOrders.customerId})`,
      })
      .from(dashboardOrders)
      .where(
        and(
          eq(dashboardOrders.tenantId, tenantId),
          eq(dashboardOrders.financialStatus, 'paid'),
          ...dateFilters
        )
      );

    // Calculate previous period for growth comparison
    const periodLength = from && to 
      ? new Date(to).getTime() - new Date(from).getTime()
      : 30 * 24 * 60 * 60 * 1000; // Default to 30 days

    const prevFrom = new Date((from ? new Date(from) : new Date()).getTime() - periodLength);
    const prevTo = new Date((to ? new Date(to) : new Date()).getTime() - periodLength);

    const previousStats = await db
      .select({
        totalOrders: sql<number>`count(${dashboardOrders.id})`,
        totalRevenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}), 0)`,
        totalCustomers: sql<number>`count(distinct ${dashboardOrders.customerId})`,
      })
      .from(dashboardOrders)
      .where(
        and(
          eq(dashboardOrders.tenantId, tenantId),
          eq(dashboardOrders.financialStatus, 'paid'),
          gte(dashboardOrders.orderDate, prevFrom),
          lte(dashboardOrders.orderDate, prevTo)
        )
      );

    // Get total unique customers for the tenant
    const totalCustomersResult = await db
      .select({
        count: sql<number>`count(${dashboardCustomers.id})`,
      })
      .from(dashboardCustomers)
      .where(eq(dashboardCustomers.tenantId, tenantId));

    const current = currentStats[0];
    const previous = previousStats[0];
    const totalCustomers = totalCustomersResult[0].count;

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate average order value
    const averageOrderValue = current.totalOrders > 0 
      ? Math.round((current.totalRevenue / current.totalOrders) * 100) / 100
      : 0;

    const overview: DashboardOverview = {
      totalCustomers: totalCustomers,
      totalOrders: current.totalOrders,
      totalRevenue: Math.round(current.totalRevenue * 100) / 100,
      averageOrderValue,
      revenueGrowth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
      ordersGrowth: calculateGrowth(current.totalOrders, previous.totalOrders),
      customersGrowth: calculateGrowth(current.totalCustomers, previous.totalCustomers),
    };

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch analytics overview',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
