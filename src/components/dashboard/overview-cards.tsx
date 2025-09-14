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
      bgGradient: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      description: 'Registered shoppers',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      growth: data?.ordersGrowth || 0,
      icon: '🛒',
      bgGradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      description: 'Successful purchases',
      format: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Total Revenue',
      value: data?.totalRevenue || 0,
      growth: data?.revenueGrowth || 0,
      icon: '💳',
      bgGradient: 'from-purple-500 to-pink-500',
      bgLight: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      description: 'Total sales value',
      format: (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: 'Average Order Value',
      value: data?.averageOrderValue || 0,
      growth: null, // AOV doesn't have a growth metric
      icon: '💎',
      bgGradient: 'from-orange-500 to-red-500',
      bgLight: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      description: 'Average purchase',
      format: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-xl"></div>
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="w-32 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
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
          className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className={`absolute top-0 right-0 w-20 h-20 ${card.bgLight} rounded-full -mr-10 -mt-10 opacity-20 group-hover:opacity-30 transition-opacity`}></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {card.icon}
              </div>
              {card.growth !== null && (
                <GrowthIndicator growth={card.growth} />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">
                {card.format(card.value)}
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {card.title}
              </div>
              <div className={`text-xs ${card.textColor} flex items-center`}>
                <span className="inline-block w-2 h-2 rounded-full ${card.bgGradient.replace('from-', 'bg-').replace(' to-.*', '')} mr-2"></span>
                {card.description}
              </div>
            </div>
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
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
      isPositive 
        ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
        : 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
    }`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{Math.abs(growth)}%</span>
      <span className="text-2xs opacity-60">{isPositive ? 'UP' : 'DOWN'}</span>
    </div>
  );
}
