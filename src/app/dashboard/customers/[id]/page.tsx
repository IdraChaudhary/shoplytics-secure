'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock customer data - in real app would come from encrypted database
const CUSTOMER_DATA = {
  '1': {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 's***@email.com', // Masked for privacy
    phone: '+1-555-****',
    totalOrders: 8,
    totalSpent: 542.18,
    averageOrderValue: 67.77,
    lastOrderDate: '2024-09-10',
    firstOrderDate: '2024-01-15',
    segment: 'high-value',
    churnRiskScore: 0.05,
    acceptsMarketing: true,
    location: 'New York, NY',
    status: 'active',
    orders: [
      {
        id: 'ord-001',
        orderNumber: '#1001',
        date: '2024-09-10',
        status: 'fulfilled',
        total: 89.97,
        items: 2,
        products: ['Classic White Cotton Shirt', 'Premium Leather Sneakers']
      },
      {
        id: 'ord-002',
        orderNumber: '#1002',
        date: '2024-08-28',
        status: 'fulfilled',
        total: 124.50,
        items: 3,
        products: ['Elegant Floral Summer Dress', 'Silk Evening Blouse']
      },
      {
        id: 'ord-003',
        orderNumber: '#1003',
        date: '2024-08-15',
        status: 'fulfilled',
        total: 67.99,
        items: 1,
        products: ['Vintage Denim Jacket']
      },
      {
        id: 'ord-004',
        orderNumber: '#1004',
        date: '2024-07-22',
        status: 'fulfilled',
        total: 156.23,
        items: 4,
        products: ['Comfortable Jogger Pants', 'Classic White Cotton Shirt', 'Premium Leather Sneakers']
      },
      {
        id: 'ord-005',
        orderNumber: '#1005',
        date: '2024-06-18',
        status: 'fulfilled',
        total: 45.99,
        items: 1,
        products: ['Elegant Floral Summer Dress']
      }
    ],
    spendingOverTime: [
      { month: 'Jan', amount: 89.97 },
      { month: 'Feb', amount: 124.50 },
      { month: 'Mar', amount: 67.99 },
      { month: 'Apr', amount: 156.23 },
      { month: 'May', amount: 45.99 },
      { month: 'Jun', amount: 78.45 },
      { month: 'Jul', amount: 92.34 },
      { month: 'Aug', amount: 67.89 },
    ],
    favoriteCategories: [
      { category: 'Shirts', count: 5, amount: 234.50 },
      { category: 'Dresses', count: 3, amount: 156.78 },
      { category: 'Footwear', count: 2, amount: 89.99 },
      { category: 'Jackets', count: 1, amount: 67.99 },
    ]
  },
  // Add more mock customer data as needed
};

const getSegmentColor = (segment: string) => {
  const colors = {
    'high-value': '#10B981',
    'regular': '#3B82F6',
    'at-risk': '#F59E0B',
    'new': '#8B5CF6',
  };
  return colors[segment as keyof typeof colors] || '#6B7280';
};

const getSegmentLabel = (segment: string) => {
  switch (segment) {
    case 'high-value':
      return 'High-Value';
    case 'at-risk':
      return 'At-Risk';
    case 'regular':
      return 'Regular';
    case 'new':
      return 'New';
    default:
      return segment;
  }
};

const getRiskLevel = (score: number) => {
  if (score > 0.7) return { label: 'High', color: 'text-red-600 bg-red-50' };
  if (score > 0.4) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'Low', color: 'text-green-600 bg-green-50' };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'fulfilled':
      return 'text-green-600 bg-green-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function CustomerProfilePage() {
  const params = useParams();
  const customerId = params.id as string;
  
  const customer = CUSTOMER_DATA[customerId as keyof typeof CUSTOMER_DATA];

  if (!customer) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
        <p className="mt-1 text-sm text-gray-500">The customer you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  const riskLevel = getRiskLevel(customer.churnRiskScore);
  const daysSinceLastOrder = Math.floor((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Customers
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            Send Email
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Create Order
          </button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="text-gray-500">Customer since {new Date(customer.firstOrderDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: getSegmentColor(customer.segment) }}
              >
                {getSegmentLabel(customer.segment)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskLevel.color}`}>
                {customer.churnRiskScore > 0.7 && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                {riskLevel.label} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center">
              <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-500">{customer.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Order</p>
                <p className="text-sm text-gray-500">{daysSinceLastOrder} days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${customer.averageOrderValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                customer.acceptsMarketing ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {customer.acceptsMarketing ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Marketing</p>
              <p className="text-2xl font-bold text-gray-900">
                {customer.acceptsMarketing ? 'Opted In' : 'Opted Out'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customer.spendingOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
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
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount Spent']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Favorite Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Favorite Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customer.favoriteCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
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
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Spent']}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-500">Last {customer.orders.length} orders</p>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customer.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Customer Privacy Protection</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This customer profile shows masked data for privacy compliance. In production, 
                sensitive information is encrypted and only displayed to authorized users with 
                proper decryption permissions. All customer interactions are logged for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
