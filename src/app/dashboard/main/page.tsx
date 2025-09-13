'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DateRange, DashboardOverview, OrdersByDateData, TopCustomer } from '@/types/dashboard';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrdersChart } from '@/components/dashboard/orders-chart';
import { TopCustomersTable } from '@/components/dashboard/top-customers-table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { subDays } from 'date-fns';

// Mock tenant ID - In real app, this would come from authentication
const MOCK_TENANT_ID = 1;

export default function MainDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersByDateData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockOverviewData: DashboardOverview = {
    totalCustomers: 1247,
    totalOrders: 3856,
    totalRevenue: 127845.50,
    averageOrderValue: 33.16,
    revenueGrowth: 15.3,
    ordersGrowth: 12.8,
    customersGrowth: 8.9,
  };

  const mockOrdersData: OrdersByDateData[] = [
    { date: '2024-09-01', orders: 45, revenue: 1582.30 },
    { date: '2024-09-02', orders: 52, revenue: 1743.20 },
    { date: '2024-09-03', orders: 38, revenue: 1245.80 },
    { date: '2024-09-04', orders: 61, revenue: 2012.45 },
    { date: '2024-09-05', orders: 47, revenue: 1654.70 },
    { date: '2024-09-06', orders: 55, revenue: 1876.20 },
    { date: '2024-09-07', orders: 42, revenue: 1398.60 },
    { date: '2024-09-08', orders: 59, revenue: 1987.40 },
    { date: '2024-09-09', orders: 48, revenue: 1623.80 },
    { date: '2024-09-10', orders: 67, revenue: 2234.90 },
    { date: '2024-09-11', orders: 53, revenue: 1789.30 },
    { date: '2024-09-12', orders: 44, revenue: 1456.70 },
    { date: '2024-09-13', orders: 39, revenue: 1289.50 },
  ];

  const mockTopCustomers: TopCustomer[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      totalSpent: 4573.80,
      ordersCount: 23,
      lastOrderDate: '2024-09-10T14:30:00Z',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      totalSpent: 3892.45,
      ordersCount: 18,
      lastOrderDate: '2024-09-12T09:15:00Z',
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      totalSpent: 3654.20,
      ordersCount: 21,
      lastOrderDate: '2024-09-08T16:45:00Z',
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'james.wilson@email.com',
      totalSpent: 3298.75,
      ordersCount: 16,
      lastOrderDate: '2024-09-11T11:20:00Z',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      totalSpent: 2967.30,
      ordersCount: 14,
      lastOrderDate: '2024-09-13T13:10:00Z',
    },
  ];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo, use mock data
      // In production, these would be real API calls:
      /*
      const fromStr = dateRange.from.toISOString().split('T')[0];
      const toStr = dateRange.to.toISOString().split('T')[0];

      // Fetch overview data
      const overviewResponse = await fetch(
        `/api/analytics/overview/${MOCK_TENANT_ID}?from=${fromStr}&to=${toStr}`
      );
      if (overviewResponse.ok) {
        const overviewResult = await overviewResponse.json();
        if (overviewResult.success) {
          setOverview(overviewResult.data);
        }
      }

      // Fetch orders data
      const ordersResponse = await fetch(
        `/api/analytics/orders/${MOCK_TENANT_ID}?from=${fromStr}&to=${toStr}&groupBy=day`
      );
      if (ordersResponse.ok) {
        const ordersResult = await ordersResponse.json();
        if (ordersResult.success) {
          setOrdersData(ordersResult.data);
        }
      }

      // Fetch top customers
      const customersResponse = await fetch(
        `/api/analytics/customers/top/${MOCK_TENANT_ID}?limit=5`
      );
      if (customersResponse.ok) {
        const customersResult = await customersResponse.json();
        if (customersResult.success) {
          setTopCustomers(customersResult.data);
        }
      }
      */

      // Use mock data
      setOverview(mockOverviewData);
      setOrdersData(mockOrdersData);
      setTopCustomers(mockTopCustomers);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when date range changes
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Unable to load dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🛍️</span>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">Shoplytics Secure</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-slate-600 dark:text-slate-400">Welcome back!</span>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <span className="text-slate-600 dark:text-slate-400">👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor your store's performance and customer insights in real-time.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          </div>
        </div>

        {/* Overview Cards */}
        <OverviewCards data={overview} isLoading={isLoading} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RevenueChart data={ordersData} isLoading={isLoading} height={350} />
          <OrdersChart data={ordersData} isLoading={isLoading} height={350} />
        </div>

        {/* Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Demo Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Demo Dashboard</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      This dashboard shows sample data for demonstration purposes. In a production environment, 
                      this would display real analytics from your Shopify store with proper authentication and 
                      multi-tenant data isolation.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="flex space-x-2">
                      <Link
                        href="/store"
                        className="bg-blue-100 dark:bg-blue-800 px-3 py-1.5 rounded-md text-sm font-medium text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        View Demo Store
                      </Link>
                      <Link
                        href="/dashboard"
                        className="bg-blue-100 dark:bg-blue-800 px-3 py-1.5 rounded-md text-sm font-medium text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        Original Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <TopCustomersTable data={topCustomers} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
