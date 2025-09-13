'use client';

import { useState } from 'react';
import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';
import { 
  UserIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

type HeroIconType = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'ref'> & {
    title?: string;
    titleId?: string;
  } & RefAttributes<SVGSVGElement>
>;

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// Mock data for demonstration - in real app would come from API
const DEMO_STATS = {
  totalCustomers: 156,
  totalOrders: 423,
  totalRevenue: 18765.32,
  averageOrderValue: 44.35,
  previousPeriodStats: {
    totalCustomers: 134,
    totalOrders: 378,
    totalRevenue: 16234.12,
    averageOrderValue: 42.95,
  }
};

const ORDERS_OVER_TIME = [
  { date: '2024-09-01', orders: 12, revenue: 485.20 },
  { date: '2024-09-02', orders: 8, revenue: 324.80 },
  { date: '2024-09-03', orders: 15, revenue: 672.45 },
  { date: '2024-09-04', orders: 21, revenue: 945.30 },
  { date: '2024-09-05', orders: 18, revenue: 789.60 },
  { date: '2024-09-06', orders: 25, revenue: 1125.75 },
  { date: '2024-09-07', orders: 19, revenue: 834.25 },
  { date: '2024-09-08', orders: 16, revenue: 698.40 },
  { date: '2024-09-09', orders: 23, revenue: 1012.85 },
  { date: '2024-09-10', orders: 27, revenue: 1189.20 },
  { date: '2024-09-11', orders: 22, revenue: 956.70 },
  { date: '2024-09-12', orders: 20, revenue: 875.00 },
  { date: '2024-09-13', orders: 14, revenue: 598.30 },
];

const TOP_PRODUCTS = [
  { name: 'Classic White Cotton Shirt', sales: 45, revenue: 1124.55 },
  { name: 'Premium Leather Sneakers', sales: 32, revenue: 2879.68 },
  { name: 'Elegant Floral Summer Dress', sales: 28, revenue: 1287.72 },
  { name: 'Vintage Denim Jacket', sales: 21, revenue: 1679.79 },
  { name: 'Comfortable Jogger Pants', sales: 35, revenue: 1224.65 },
];

const CUSTOMER_SEGMENTS = [
  { name: 'High-Value', value: 23, color: '#10B981' },
  { name: 'Regular', value: 89, color: '#3B82F6' },
  { name: 'At-Risk', value: 28, color: '#F59E0B' },
  { name: 'New', value: 16, color: '#8B5CF6' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  icon: HeroIconType;
  format?: 'currency' | 'number' | 'percentage';
}

const StatCard = ({ title, value, previousValue, icon: Icon, format = 'number' }: StatCardProps) => {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    switch (format) {
      case 'currency':
        return `$${numVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      default:
        return numVal.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (!previousValue) return null;
    const current = typeof value === 'string' ? parseFloat(value) : value;
    const previous = typeof previousValue === 'string' ? parseFloat(previousValue) : previousValue;
    const change = ((current - previous) / previous) * 100;
    return change;
  };

  const change = calculateChange();
  const isPositive = change && change > 0;

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatValue(value)}
                </div>
                {change !== null && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <ArrowTrendingUpIcon className="flex-shrink-0 w-4 h-4 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="flex-shrink-0 w-4 h-4 mr-1" />
                    )}
                    {Math.abs(change).toFixed(1)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const stats = [
    {
      title: 'Total Customers',
      value: DEMO_STATS.totalCustomers,
      previousValue: DEMO_STATS.previousPeriodStats.totalCustomers,
      icon: UserIcon,
    },
    {
      title: 'Total Orders',
      value: DEMO_STATS.totalOrders,
      previousValue: DEMO_STATS.previousPeriodStats.totalOrders,
      icon: ShoppingBagIcon,
    },
    {
      title: 'Total Revenue',
      value: DEMO_STATS.totalRevenue,
      previousValue: DEMO_STATS.previousPeriodStats.totalRevenue,
      icon: CurrencyDollarIcon,
      format: 'currency' as const,
    },
    {
      title: 'Average Order Value',
      value: DEMO_STATS.averageOrderValue,
      previousValue: DEMO_STATS.previousPeriodStats.averageOrderValue,
      icon: ArrowTrendingUpIcon,
      format: 'currency' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Orders Over Time</h3>
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="w-4 h-4 mr-1" />
              Last 13 days
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ORDERS_OVER_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Segments</h3>
            <div className="text-sm text-gray-500">
              Total: {CUSTOMER_SEGMENTS.reduce((sum, segment) => sum + segment.value, 0)} customers
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CUSTOMER_SEGMENTS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {CUSTOMER_SEGMENTS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '14px', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
          <p className="text-sm text-gray-500">Products with the highest sales volume</p>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {TOP_PRODUCTS.map((product, index) => (
                <tr key={product.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(product.revenue / product.sales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <EyeIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Dashboard</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This dashboard shows sample data for demonstration purposes. In a production environment, 
                this would display real analytics from your Shopify store with proper authentication and 
                multi-tenant data isolation.
              </p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                  onClick={() => window.open('/store', '_blank')}
                >
                  View Demo Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
