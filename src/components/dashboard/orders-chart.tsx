'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { OrdersByDateData } from '@/types/dashboard';
import { format, parseISO } from 'date-fns';

interface OrdersChartProps {
  data: OrdersByDateData[];
  isLoading?: boolean;
  height?: number;
}

export function OrdersChart({ data, isLoading = false, height = 300 }: OrdersChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd'),
    orders: Number(item.orders),
  }));

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const orderCount = Number(data.value);
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {format(parseISO(label as string), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center">
                🛒 Orders:
              </span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {orderCount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
              📊 {orderCount > 50 ? 'High volume day!' : orderCount > 25 ? 'Moderate activity' : 'Light sales'}
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

  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/20 to-emerald-100/20 dark:from-green-900/10 dark:to-emerald-900/10 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mr-4 shadow-lg">
              <span className="text-white text-xl">🛒</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Orders by Date
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                📈 Daily order volume trends
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Orders</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {totalOrders.toLocaleString()}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              🎉 Successful purchases
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="orders"
            fill="url(#orderGradient)"
            radius={[6, 6, 0, 0]}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
