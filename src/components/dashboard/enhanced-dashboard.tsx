'use client';

import React, { useState, useEffect } from 'react';
import { DateRange, DashboardOverview, OrdersByDateData, TopCustomer } from '@/types/dashboard';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { OrdersChart } from '@/components/dashboard/orders-chart';
import { TopCustomersTable } from '@/components/dashboard/top-customers-table';
import { DateRangePicker } from '@/components/dashboard/date-range-picker';
import { subDays } from 'date-fns';
import { 
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  SparklesIcon,
  ArrowTrendingUpIcon as TrendingUpIcon
} from '@heroicons/react/24/outline';

interface EnhancedDashboardProps {
  tenantId: string | number;
}

export function EnhancedDashboard({ tenantId }: EnhancedDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [ordersData, setOrdersData] = useState<OrdersByDateData[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced mock data for demonstration with shopping context
  const mockOverviewData: DashboardOverview = {
    totalCustomers: 2847,
    totalOrders: 8956,
    totalRevenue: 387845.75,
    averageOrderValue: 43.32,
    revenueGrowth: 18.7,
    ordersGrowth: 24.3,
    customersGrowth: 12.8,
  };

  const mockOrdersData: OrdersByDateData[] = [
    { date: '2024-09-01', orders: 89, revenue: 3824.50 },
    { date: '2024-09-02', orders: 112, revenue: 4867.20 },
    { date: '2024-09-03', orders: 76, revenue: 3198.80 },
    { date: '2024-09-04', orders: 134, revenue: 5789.45 },
    { date: '2024-09-05', orders: 98, revenue: 4234.70 },
    { date: '2024-09-06', orders: 156, revenue: 6754.20 },
    { date: '2024-09-07', orders: 87, revenue: 3678.60 },
    { date: '2024-09-08', orders: 143, revenue: 6187.40 },
    { date: '2024-09-09', orders: 109, revenue: 4723.80 },
    { date: '2024-09-10', orders: 178, revenue: 7634.90 },
    { date: '2024-09-11', orders: 132, revenue: 5689.30 },
    { date: '2024-09-12', orders: 95, revenue: 4156.70 },
    { date: '2024-09-13', orders: 84, revenue: 3589.50 },
  ];

  const mockTopCustomers: TopCustomer[] = [
    {
      id: 1,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@shopaholic.com',
      totalSpent: 8973.80,
      ordersCount: 47,
      lastOrderDate: '2024-09-12T16:30:00Z',
    },
    {
      id: 2,
      name: 'Marcus Thompson',
      email: 'marcus.thompson@fashionista.com',
      totalSpent: 6892.45,
      ordersCount: 32,
      lastOrderDate: '2024-09-13T11:15:00Z',
    },
    {
      id: 3,
      name: 'Isabella Chen',
      email: 'isabella.chen@styleenthusiast.com',
      totalSpent: 5754.20,
      ordersCount: 28,
      lastOrderDate: '2024-09-10T14:45:00Z',
    },
    {
      id: 4,
      name: 'David Johnson',
      email: 'david.johnson@trendseeker.com',
      totalSpent: 4798.75,
      ordersCount: 23,
      lastOrderDate: '2024-09-11T09:20:00Z',
    },
    {
      id: 5,
      name: 'Sophia Williams',
      email: 'sophia.williams@luxurylover.com',
      totalSpent: 4267.30,
      ordersCount: 19,
      lastOrderDate: '2024-09-13T13:10:00Z',
    },
  ];

  // Fetch dashboard data with tenant filtering
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // In production, these would be real API calls with tenant filtering:
      /*
      const fromStr = dateRange.from.toISOString().split('T')[0];
      const toStr = dateRange.to.toISOString().split('T')[0];

      const [overviewResponse, ordersResponse, customersResponse] = await Promise.all([
        fetch(`/api/analytics/overview/${tenantId}?from=${fromStr}&to=${toStr}`),
        fetch(`/api/analytics/orders/${tenantId}?from=${fromStr}&to=${toStr}&groupBy=day`),
        fetch(`/api/analytics/customers/top/${tenantId}?limit=5`)
      ]);

      // Handle responses...
      */

      // Use mock data for demo
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
  }, [dateRange, tenantId]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🛍️</div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-lg dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">🛍️</span>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Shoplytics Secure
                  </span>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Multi-tenant Analytics Platform
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Tenant Info */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-slate-100/60 dark:bg-slate-700/60 rounded-xl">
                <ShoppingBagIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tenant: {tenantId}
                </span>
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              
              {/* User Menu */}
              <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <UserCircleIcon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                <span className="hidden lg:block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Store Manager
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with enhanced visuals */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center mb-4">
              <SparklesIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Shopping Analytics Dashboard
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Monitor your e-commerce performance and customer insights in real-time
            </p>
            <div className="flex items-center mt-2 text-sm text-slate-500 dark:text-slate-500">
              <TrendingUpIcon className="w-4 h-4 mr-1" />
              Multi-tenant secure analytics • Real-time data processing
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="mb-8">
          <OverviewCards data={overview} isLoading={isLoading} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <RevenueChart data={ordersData} isLoading={isLoading} height={400} />
          <OrdersChart data={ordersData} isLoading={isLoading} height={400} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Top Customers */}
          <div className="xl:col-span-2">
            <TopCustomersTable data={topCustomers} isLoading={isLoading} />
          </div>
          
          {/* Additional Info Panel */}
          <div className="space-y-6">
            {/* Store Performance Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Performance Summary
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    🎯 Conversion Rate
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    3.2%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    🛒 Cart Abandonment
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    68.5%
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    🔄 Return Rate
                  </span>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    4.1%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <span className="text-lg mr-2">⚡</span>
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    🎨 Customize Dashboard
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    📊 Export Reports
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    🔔 Set Alerts
                  </span>
                  <span className="text-xs text-slate-500">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-3xl">🎯</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-2">
                Enhanced Shopping Dashboard Demo
              </h3>
              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                <p>
                  This is a comprehensive multi-tenant e-commerce analytics dashboard featuring:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>🛍️ Shopping-themed UI with modern design</li>
                  <li>📊 Interactive charts with hover effects and tooltips</li>
                  <li>👥 Enhanced customer insights with VIP levels</li>
                  <li>📅 Advanced date range selection</li>
                  <li>🏢 Multi-tenant data isolation</li>
                  <li>📱 Fully responsive design</li>
                </ul>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors">
                  🛒 View Demo Store
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors">
                  📚 Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
