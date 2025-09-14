'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { OrdersByDateData } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  data: OrdersByDateData[];
  isLoading?: boolean;
  height?: number;
}

export function RevenueChart({ data, isLoading = false, height = 300 }: RevenueChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    revenue: Number(item.revenue),
  }));

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const revenue = Number(data.value);
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {format(parseISO(label as string), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                💳 Revenue:
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
              📈 {revenue > 2000 ? 'Excellent sales!' : revenue > 1000 ? 'Good performance' : 'Room for growth'}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="w-20 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse`} style={{ height }}></div>
      </div>
    );
  }

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/20 to-purple-100/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mr-4 shadow-lg">
              <span className="text-white text-xl">💳</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Revenue Trend
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                📈 Track your revenue over time
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              💰 Sales earnings
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="currentColor" 
            className="text-slate-200 dark:text-slate-700" 
          />
          <XAxis
            dataKey="formattedDate"
            stroke="currentColor"
            className="text-slate-600 dark:text-slate-400"
            fontSize={12}
            tick={{ fill: 'currentColor' }}
          />
          <YAxis
            stroke="currentColor"
            className="text-slate-600 dark:text-slate-400"
            fontSize={12}
            tick={{ fill: 'currentColor' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#revenueGradient)"
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, className: 'drop-shadow-sm' }}
            activeDot={{ 
              r: 8, 
              stroke: '#3b82f6', 
              strokeWidth: 3, 
              fill: '#ffffff',
              className: 'drop-shadow-lg animate-pulse'
            }}
          />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
