'use client';

import React from 'react';
import { DashboardOverview } from '@/types/dashboard';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface OverviewCardsProps {
  data: DashboardOverview | null;
  isLoading?: boolean;
}

export function OverviewCards({ data, isLoading = false }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Customers',
      value: data?.totalCustomers || 0,
      growth: data?.customersGrowth || 0,
      icon: '👥',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      growth: data?.ordersGrowth || 0,
      icon: '📦',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Revenue',
      value: data?.totalRevenue || 0,
      growth: data?.revenueGrowth || 0,
      icon: '💰',
      format: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Average Order Value',
      value: data?.averageOrderValue || 0,
      growth: null, // AOV doesn't have a growth metric
      icon: '📊',
      format: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
              {card.icon}
            </div>
            {card.growth !== null && (
              <GrowthIndicator growth={card.growth} />
            )}
          </div>
          
          <div className="mb-1">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {card.format(card.value)}
            </div>
          </div>
          
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GrowthIndicatorProps {
  growth: number;
}

function GrowthIndicator({ growth }: GrowthIndicatorProps) {
  const isPositive = growth >= 0;
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isPositive 
        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
    }`}>
      <Icon className="w-3 h-3" />
      <span>{Math.abs(growth)}%</span>
    </div>
  );
}
