import { NextRequest, NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getDb } from '@/lib/database/connection';
import { dashboardOrders, tenants } from '@/lib/database/schemas/tenants';

// Prevent static prerendering of this route
export const dynamic = 'force-dynamic';
import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { OrdersByDateData } from '@/types/dashboard';

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
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month

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
    const dateFilters = [eq(dashboardOrders.tenantId, tenantId)];
    if (from) {
      dateFilters.push(gte(dashboardOrders.orderDate, new Date(from)));
    }
    if (to) {
      dateFilters.push(lte(dashboardOrders.orderDate, new Date(to)));
    }

    // Build date grouping SQL based on groupBy parameter
    let dateGroupSql: any;
    let dateFormatSql: any;

    switch (groupBy) {
      case 'week':
        dateGroupSql = sql`DATE_TRUNC('week', ${dashboardOrders.orderDate})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('week', ${dashboardOrders.orderDate}), 'YYYY-MM-DD')`;
        break;
      case 'month':
        dateGroupSql = sql`DATE_TRUNC('month', ${dashboardOrders.orderDate})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('month', ${dashboardOrders.orderDate}), 'YYYY-MM-DD')`;
        break;
      default: // day
        dateGroupSql = sql`DATE_TRUNC('day', ${dashboardOrders.orderDate})`;
        dateFormatSql = sql`TO_CHAR(DATE_TRUNC('day', ${dashboardOrders.orderDate}), 'YYYY-MM-DD')`;
    }

    // Query orders grouped by date
    const ordersData = await db
      .select({
        date: dateFormatSql,
        orders: sql<number>`count(${dashboardOrders.id})`,
        revenue: sql<number>`coalesce(sum(${dashboardOrders.totalPrice}), 0)`,
      })
      .from(dashboardOrders)
      .where(and(...dateFilters))
      .groupBy(dateGroupSql)
      .orderBy(dateGroupSql);

    // Transform data for frontend
    const transformedData: OrdersByDateData[] = ordersData.map((row) => ({
      date: row.date,
      orders: row.orders,
      revenue: Math.round(row.revenue * 100) / 100,
    }));

    // Fill in missing dates with zero values if needed
    if (from && to && transformedData.length > 0) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      const filledData: OrdersByDateData[] = [];
      
      const existingDates = new Set(transformedData.map(d => d.date));
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existing = transformedData.find(item => item.date === dateStr);
        
        filledData.push(existing || {
          date: dateStr,
          orders: 0,
          revenue: 0,
        });
      }
      
      return NextResponse.json({
        success: true,
        data: filledData,
      });
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error('Orders analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch orders analytics',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
