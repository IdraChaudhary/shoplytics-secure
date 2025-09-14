'use client';

import React from 'react';
import { TopCustomer } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';

interface TopCustomersTableProps {
  data: TopCustomer[];
  isLoading?: boolean;
}

export function TopCustomersTable({ data, isLoading = false }: TopCustomersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-6">
          <div className="w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex-1">
                <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                <div className="w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="w-16 h-4 bg-slate-200 dark:bg-slate-700 rounded mb-1 animate-pulse"></div>
                <div className="w-12 h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Top Customers
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Your highest spending customers
          </p>
        </div>
        
        <div className="text-center py-8">
          <div className="text-slate-400 dark:text-slate-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No customer data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100/20 to-orange-100/20 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-full -mr-12 -mt-12"></div>
      
      <div className="relative">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mr-3 shadow-lg">
              <span className="text-white text-lg">🏆</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Top Customers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                💎 Your highest spending customers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((customer, index) => {
          const isTopCustomer = index === 0;
          const vipLevel = customer.totalSpent > 4000 ? 'VIP' : customer.totalSpent > 3000 ? 'Premium' : 'Regular';
          const vipColor = vipLevel === 'VIP' ? 'text-yellow-600' : vipLevel === 'Premium' ? 'text-purple-600' : 'text-blue-600';
          const vipBg = vipLevel === 'VIP' ? 'bg-yellow-50 border-yellow-200' : vipLevel === 'Premium' ? 'bg-purple-50 border-purple-200' : 'bg-blue-50 border-blue-200';
          
          return (
            <div
              key={customer.id}
              className={`group relative flex items-center justify-between p-4 border rounded-xl hover:shadow-lg transition-all duration-200 ${
                isTopCustomer 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-md' 
                  : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-600/30'
              }`}
            >
              {/* Customer Avatar and Rank */}
              <div className="flex items-center flex-1">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                    isTopCustomer 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-500'
                  }`}>
                    {isTopCustomer ? '🏆' : `#${index + 1}`}
                  </div>
                  {/* VIP Badge */}
                  {vipLevel !== 'Regular' && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      vipLevel === 'VIP' ? 'bg-yellow-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {vipLevel === 'VIP' ? '⭐' : '💎'}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {customer.name}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${vipBg} ${vipColor} border`}>
                      {vipLevel}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    📧 {customer.email}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-slate-500">
                    <span className="flex items-center">
                      🛒 {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
                    </span>
                    {customer.lastOrderDate && (
                      <span className="flex items-center">
                        📅 {format(parseISO(customer.lastOrderDate), 'MMM dd')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Spending Info */}
              <div className="text-right ml-4">
                <div className={`text-lg font-bold ${
                  isTopCustomer 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Total lifetime value
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  Avg: ${(customer.totalSpent / customer.ordersCount).toFixed(0)} per order
                </div>
              </div>

              {/* Hover effect decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </div>
          );
        })}
      </div>

      {data.length >= 5 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-500">
              📈 Showing top {data.length} customers
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200">
              <span>View all customers</span>
              <span>👥</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
