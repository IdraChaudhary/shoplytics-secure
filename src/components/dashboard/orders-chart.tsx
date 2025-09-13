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
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
            {format(parseISO(label as string), 'EEEE, MMMM dd, yyyy')}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Orders: {Number(data.value).toLocaleString()}
          </p>
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Orders by Date
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Daily order volume trends
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">
            {totalOrders.toLocaleString()}
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
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
