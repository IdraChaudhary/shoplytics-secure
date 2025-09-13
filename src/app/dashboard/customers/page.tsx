'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  StarIcon,
  ShoppingBagIcon,
  EnvelopeIcon,
  PhoneIcon,
  EyeIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Mock customer data - in real app would come from encrypted database
const DEMO_CUSTOMERS = [
  {
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
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'm***@email.com',
    phone: '+1-555-****',
    totalOrders: 3,
    totalSpent: 189.97,
    averageOrderValue: 63.32,
    lastOrderDate: '2024-08-25',
    firstOrderDate: '2024-02-03',
    segment: 'at-risk',
    churnRiskScore: 0.75,
    acceptsMarketing: false,
    location: 'Los Angeles, CA',
    status: 'inactive',
  },
  {
    id: '3',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'e***@email.com',
    phone: '+1-555-****',
    totalOrders: 12,
    totalSpent: 789.45,
    averageOrderValue: 65.79,
    lastOrderDate: '2024-09-12',
    firstOrderDate: '2024-02-20',
    segment: 'high-value',
    churnRiskScore: 0.02,
    acceptsMarketing: true,
    location: 'Chicago, IL',
    status: 'active',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Rodriguez',
    email: 'd***@email.com',
    phone: '+1-555-****',
    totalOrders: 2,
    totalSpent: 124.98,
    averageOrderValue: 62.49,
    lastOrderDate: '2024-09-08',
    firstOrderDate: '2024-03-10',
    segment: 'regular',
    churnRiskScore: 0.35,
    acceptsMarketing: true,
    location: 'Houston, TX',
    status: 'active',
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Thompson',
    email: 'l***@email.com',
    phone: '+1-555-****',
    totalOrders: 1,
    totalSpent: 45.99,
    averageOrderValue: 45.99,
    lastOrderDate: '2024-09-05',
    firstOrderDate: '2024-03-25',
    segment: 'new',
    churnRiskScore: 0.45,
    acceptsMarketing: false,
    location: 'Phoenix, AZ',
    status: 'new',
  },
  {
    id: '6',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'j***@email.com',
    phone: '+1-555-****',
    totalOrders: 6,
    totalSpent: 378.45,
    averageOrderValue: 63.08,
    lastOrderDate: '2024-09-11',
    firstOrderDate: '2024-04-05',
    segment: 'regular',
    churnRiskScore: 0.15,
    acceptsMarketing: true,
    location: 'Seattle, WA',
    status: 'active',
  },
];

const SEGMENT_COLORS = {
  'high-value': '#10B981',
  'regular': '#3B82F6',
  'at-risk': '#F59E0B',
  'new': '#8B5CF6',
};

const SEGMENT_STATS = [
  { name: 'High-Value', count: 23, percentage: 14.7, avgSpent: 587.23, color: '#10B981' },
  { name: 'Regular', count: 89, percentage: 57.1, avgSpent: 234.56, color: '#3B82F6' },
  { name: 'At-Risk', count: 28, percentage: 17.9, avgSpent: 156.78, color: '#F59E0B' },
  { name: 'New', count: 16, percentage: 10.3, avgSpent: 78.43, color: '#8B5CF6' },
];

const SPENDING_DISTRIBUTION = [
  { range: '$0-$50', count: 24, percentage: 15.4 },
  { range: '$51-$150', count: 45, percentage: 28.8 },
  { range: '$151-$300', count: 52, percentage: 33.3 },
  { range: '$301-$500', count: 26, percentage: 16.7 },
  { range: '$500+', count: 9, percentage: 5.8 },
];

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  firstOrderDate: string;
  segment: string;
  churnRiskScore: number;
  acceptsMarketing: boolean;
  location: string;
  status: string;
}

const getSegmentColor = (segment: string) => {
  return SEGMENT_COLORS[segment as keyof typeof SEGMENT_COLORS] || '#6B7280';
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [sortField, setSortField] = useState('totalSpent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
      
      return matchesSearch && matchesSegment;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof Customer];
      const bValue = b[sortField as keyof Customer];
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpIcon className="w-4 h-4 text-gray-300" />;
    return sortDirection === 'asc' ? 
      <ArrowUpIcon className="w-4 h-4 text-gray-500" /> : 
      <ArrowDownIcon className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Insights</h1>
          <p className="text-gray-600">Analyze customer behavior and segment performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FunnelIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Customer Segments Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Segment Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Customer Segments</h3>
            <ChartPieIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEGMENT_STATS}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {SEGMENT_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} customers`,
                    name
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Spending Distribution</h3>
            <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPENDING_DISTRIBUTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="range" 
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
                  formatter={(value: number) => [`${value} customers`, 'Count']}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segment Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEGMENT_STATS.map((segment) => (
          <div key={segment.name} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">{segment.name}</h4>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{segment.count}</span>
                <span className="text-sm text-gray-500">{segment.percentage}%</span>
              </div>
              <div className="text-sm text-gray-500">
                Avg: ${segment.avgSpent.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Segments</option>
              <option value="high-value">High-Value</option>
              <option value="regular">Regular</option>
              <option value="at-risk">At-Risk</option>
              <option value="new">New</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  <div className="flex items-center justify-between">
                    Customer
                    <SortIcon field="firstName" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalOrders')}
                >
                  <div className="flex items-center justify-between">
                    Orders
                    <SortIcon field="totalOrders" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  <div className="flex items-center justify-between">
                    Total Spent
                    <SortIcon field="totalSpent" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Churn Risk
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastOrderDate')}
                >
                  <div className="flex items-center justify-between">
                    Last Order
                    <SortIcon field="lastOrderDate" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const riskLevel = getRiskLevel(customer.churnRiskScore);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="w-3 h-3 mr-1" />
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getSegmentColor(customer.segment) }}
                      >
                        {getSegmentLabel(customer.segment)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.totalOrders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${customer.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskLevel.color}`}>
                        {customer.churnRiskScore > 0.7 && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                        {riskLevel.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/dashboard/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Privacy & Demo Notice</h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                This demo shows masked customer data for privacy. In production, all PII is encrypted 
                and only authorized users can decrypt specific fields. Customer segmentation is based 
                on aggregated analytics data while maintaining complete privacy compliance.
              </p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  className="bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100"
                  onClick={() => alert('In production, this would show privacy compliance details and data handling policies.')}
                >
                  Learn More About Privacy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
