/**
 * Prisma Client Configuration for Shoplytics Secure
 * Multi-tenant database client with proper connection management and security
 */

import { PrismaClient } from '@prisma/client'
import type { 
  Tenant, 
  Customer, 
  Product, 
  Order, 
  OrderLineItem,
  OrderEvent 
} from '@prisma/client'

// Global Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined
}

// Create Prisma client with logging and error handling
export const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  errorFormat: 'pretty',
})

// Store Prisma client globally in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Enhanced logging for development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    console.log('Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

prisma.$on('error', (e) => {
  console.error('Prisma Error:', e)
})

prisma.$on('warn', (e) => {
  console.warn('Prisma Warning:', e)
})

// =====================================================
// MULTI-TENANT HELPER FUNCTIONS
// =====================================================

/**
 * Get tenant-scoped Prisma client
 * All queries will be automatically filtered by tenant ID
 */
export function getTenantClient(tenantId: string) {
  return {
    // Tenant-scoped customer operations
    customers: {
      findMany: (args?: any) => 
        prisma.customer.findMany({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findFirst: (args?: any) => 
        prisma.customer.findFirst({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findUnique: (args: any) =>
        prisma.customer.findFirst({
          where: { ...args.where, tenantId }
        }),
      create: (args: any) =>
        prisma.customer.create({
          ...args,
          data: { ...args.data, tenantId }
        }),
      update: (args: any) =>
        prisma.customer.updateMany({
          ...args,
          where: { ...args.where, tenantId }
        }),
      delete: (args: any) =>
        prisma.customer.deleteMany({
          where: { ...args.where, tenantId }
        }),
      count: (args?: any) =>
        prisma.customer.count({
          ...args,
          where: { ...args?.where, tenantId }
        })
    },

    // Tenant-scoped product operations
    products: {
      findMany: (args?: any) => 
        prisma.product.findMany({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findFirst: (args?: any) => 
        prisma.product.findFirst({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findUnique: (args: any) =>
        prisma.product.findFirst({
          where: { ...args.where, tenantId }
        }),
      create: (args: any) =>
        prisma.product.create({
          ...args,
          data: { ...args.data, tenantId }
        }),
      update: (args: any) =>
        prisma.product.updateMany({
          ...args,
          where: { ...args.where, tenantId }
        }),
      delete: (args: any) =>
        prisma.product.deleteMany({
          where: { ...args.where, tenantId }
        }),
      count: (args?: any) =>
        prisma.product.count({
          ...args,
          where: { ...args?.where, tenantId }
        })
    },

    // Tenant-scoped order operations
    orders: {
      findMany: (args?: any) => 
        prisma.order.findMany({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findFirst: (args?: any) => 
        prisma.order.findFirst({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      findUnique: (args: any) =>
        prisma.order.findFirst({
          where: { ...args.where, tenantId }
        }),
      create: (args: any) =>
        prisma.order.create({
          ...args,
          data: { ...args.data, tenantId }
        }),
      update: (args: any) =>
        prisma.order.updateMany({
          ...args,
          where: { ...args.where, tenantId }
        }),
      delete: (args: any) =>
        prisma.order.deleteMany({
          where: { ...args.where, tenantId }
        }),
      count: (args?: any) =>
        prisma.order.count({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      aggregate: (args?: any) =>
        prisma.order.aggregate({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      groupBy: (args: any) =>
        prisma.order.groupBy({
          ...args,
          where: { ...args?.where, tenantId }
        })
    },

    // Tenant-scoped order line item operations
    orderLineItems: {
      findMany: (args?: any) => 
        prisma.orderLineItem.findMany({
          ...args,
          where: { ...args?.where, tenantId }
        }),
      create: (args: any) =>
        prisma.orderLineItem.create({
          ...args,
          data: { ...args.data, tenantId }
        }),
      count: (args?: any) =>
        prisma.orderLineItem.count({
          ...args,
          where: { ...args?.where, tenantId }
        })
    }
  }
}

// =====================================================
// ANALYTICS HELPER FUNCTIONS
// =====================================================

/**
 * Get dashboard overview analytics for a tenant
 */
export async function getDashboardOverview(
  tenantId: string, 
  dateFrom?: Date, 
  dateTo?: Date
) {
  const whereClause = {
    tenantId,
    ...(dateFrom && dateTo ? {
      orderDate: {
        gte: dateFrom,
        lte: dateTo
      }
    } : {})
  }

  const [
    totalOrders,
    totalRevenue,
    totalCustomers,
    averageOrderValue
  ] = await Promise.all([
    // Total orders
    prisma.order.count({
      where: {
        ...whereClause,
        financialStatus: 'PAID'
      }
    }),
    
    // Total revenue
    prisma.order.aggregate({
      where: {
        ...whereClause,
        financialStatus: 'PAID'
      },
      _sum: {
        totalPrice: true
      }
    }),
    
    // Total unique customers
    prisma.order.findMany({
      where: {
        ...whereClause,
        customerId: { not: null }
      },
      select: {
        customerId: true
      },
      distinct: ['customerId']
    }),
    
    // Average order value
    prisma.order.aggregate({
      where: {
        ...whereClause,
        financialStatus: 'PAID'
      },
      _avg: {
        totalPrice: true
      }
    })
  ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    totalCustomers: totalCustomers.length,
    averageOrderValue: averageOrderValue._avg.totalPrice || 0
  }
}

/**
 * Get orders analytics grouped by date
 */
export async function getOrdersAnalytics(
  tenantId: string,
  dateFrom: Date,
  dateTo: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  // Use raw SQL for complex date grouping
  const dateFormat = groupBy === 'day' 
    ? 'YYYY-MM-DD' 
    : groupBy === 'week' 
      ? 'YYYY-"W"WW' 
      : 'YYYY-MM'
      
  const orders = await prisma.$queryRaw<{
    date: string
    order_count: bigint
    total_revenue: number
  }[]>`
    SELECT 
      TO_CHAR(order_date, ${dateFormat}) as date,
      COUNT(*) as order_count,
      COALESCE(SUM(total_price), 0) as total_revenue
    FROM orders 
    WHERE tenant_id = ${tenantId}
      AND order_date >= ${dateFrom}
      AND order_date <= ${dateTo}
      AND financial_status = 'PAID'
    GROUP BY TO_CHAR(order_date, ${dateFormat})
    ORDER BY date
  `

  return orders.map(order => ({
    date: order.date,
    orders: Number(order.order_count),
    revenue: Number(order.total_revenue)
  }))
}

/**
 * Get top customers by spending
 */
export async function getTopCustomers(tenantId: string, limit: number = 5) {
  return prisma.customer.findMany({
    where: { tenantId },
    orderBy: { totalSpent: 'desc' },
    take: limit,
    include: {
      _count: {
        select: { orders: true }
      }
    }
  })
}

// =====================================================
// CONNECTION MANAGEMENT
// =====================================================

/**
 * Graceful database disconnection
 */
export async function disconnect() {
  await prisma.$disconnect()
}

/**
 * Database health check
 */
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date() 
    }
  }
}

/**
 * Transaction wrapper for complex operations
 */
export async function transaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn)
}

// =====================================================
// TYPE EXPORTS
// =====================================================

// Re-export Prisma types for convenience
export type {
  Tenant,
  Customer,
  Product,
  Order,
  OrderLineItem,
  OrderEvent,
  PlanType,
  SubscriptionStatus,
  ProductStatus,
  TrendingStatus,
  OrderStatus,
  FinancialStatus,
  FulfillmentStatus,
  OrderEventType
} from '@prisma/client'

// Custom types for API responses
export interface DashboardOverview {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  revenueGrowth?: number
  ordersGrowth?: number
  customersGrowth?: number
}

export interface OrdersByDate {
  date: string
  orders: number
  revenue: number
}

export interface TopCustomer {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  totalSpent: number
  totalOrders: number
  lastOrderAt?: Date
  segmentTag?: string
}

// Export default Prisma client
export default prisma
