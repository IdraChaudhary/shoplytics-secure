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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Top Customers
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Your highest spending customers
        </p>
      </div>

      <div className="space-y-4">
        {data.map((customer, index) => (
          <div
            key={customer.id}
            className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 transition-colors"
          >
            <div className="flex items-center flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 dark:text-white truncate">
                  {customer.name}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {customer.email}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {customer.ordersCount} {customer.ordersCount === 1 ? 'order' : 'orders'}
                  {customer.lastOrderDate && (
                    <span className="ml-2">
                      Last order: {format(parseISO(customer.lastOrderDate), 'MMM dd, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right ml-4">
              <div className="font-semibold text-slate-900 dark:text-white">
                ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total spent
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length >= 5 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View all customers →
          </button>
        </div>
      )}
    </div>
  );
}
