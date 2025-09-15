'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  ShoppingBag, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  LogOut,
  Store,
  AlertCircle,
  ExternalLink,
  Brain,
  BookOpen,
  Activity,
  Beaker,
  MessageSquare
} from 'lucide-react';

interface DashboardStats {
  customers: number;
  products: number;
  orders: number;
  revenue: number;
}

function MetricCard({ title, value, icon: Icon, iconColor, change }: any) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {typeof value === 'number' && title.includes('Revenue') 
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                  : new Intl.NumberFormat('en-US').format(value)}
              </dd>
            </dl>
          </div>
        </div>
        {change && (
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +{change.percentage.toFixed(1)}% from last month
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { tenant, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!tenant) {
      window.location.href = '/login';
      return;
    }

    // Mock data loading
    setTimeout(() => {
      const mockStats: DashboardStats = {
        customers: 1247 + Math.floor(Math.random() * 10),
        products: 89 + Math.floor(Math.random() * 5),
        orders: 342 + Math.floor(Math.random() * 20),
        revenue: 45620.50 + Math.random() * 1000
      };
      setStats(mockStats);
      setLoading(false);
    }, 1500);
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Shoplytics Dashboard</h1>
                <p className="text-sm text-gray-500">{tenant.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/tutorials"
                className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Tutorials
              </Link>
              <Link
                href="/settings"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Shopify Integration Status */}
        {!tenant.hasShopifyIntegration && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <Store className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Connect Your Shopify Store
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Connect your Shopify store to start importing your data and get detailed analytics.
                </p>
                <div className="mt-4">
                  <Link
                    href="/settings"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Connect Shopify Store
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <MetricCard
            title="Total Customers"
            value={stats?.customers || 0}
            icon={Users}
            iconColor="text-blue-600"
            change={{
              value: Math.floor(Math.random() * 50),
              percentage: 2.3 + Math.random() * 5,
              trend: 'up',
              period: 'last month'
            }}
          />
          
          <MetricCard
            title="Total Products"
            value={stats?.products || 0}
            icon={Package}
            iconColor="text-green-600"
            change={{
              value: Math.floor(Math.random() * 10),
              percentage: 1.2 + Math.random() * 3,
              trend: 'up',
              period: 'last week'
            }}
          />
          
          <MetricCard
            title="Total Orders"
            value={stats?.orders || 0}
            icon={ShoppingCart}
            iconColor="text-purple-600"
            change={{
              value: Math.floor(Math.random() * 30),
              percentage: 4.7 + Math.random() * 6,
              trend: 'up',
              period: 'last month'
            }}
          />
          
          <MetricCard
            title="Total Revenue"
            value={stats?.revenue || 0}
            icon={TrendingUp}
            iconColor="text-orange-600"
            change={{
              value: Math.floor(Math.random() * 5000),
              percentage: 8.3 + Math.random() * 7,
              trend: 'up',
              period: 'last month'
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/analytics"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 ring-4 ring-white">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    <span className="absolute inset-0" />
                    View Analytics
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Explore detailed analytics and insights for your store.
                  </p>
                </div>
              </Link>

              <Link
                href="/settings"
                className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white">
                    <Settings className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    <span className="absolute inset-0" />
                    Account Settings
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your account and Shopify integration settings.
                  </p>
                </div>
              </Link>

              <div className="relative group bg-gray-50 p-6 rounded-lg opacity-50">
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white">
                    <Store className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900">
                    Sync Data
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manual data synchronization from your Shopify store.
                  </p>
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        {!tenant.hasShopifyIntegration && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">Connect Your Shopify Store</h4>
                    <p className="text-sm text-gray-500">
                      Add your Shopify store domain and access token in settings to start importing data.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">Data Import</h4>
                    <p className="text-sm text-gray-500">
                      Once connected, we'll automatically import your customers, products, and orders.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-400 text-sm font-medium">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-500">View Analytics</h4>
                    <p className="text-sm text-gray-500">
                      Explore comprehensive analytics and insights for your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
