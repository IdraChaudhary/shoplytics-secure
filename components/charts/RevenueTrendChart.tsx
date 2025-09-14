'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { 
  Download, 
  Image, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { 
  exportChartAsPNG, 
  exportChartAsCSV, 
  formatCurrency, 
  calculatePercentageChange,
  chartColors,
  generateMockChartData 
} from '@/lib/chart-utils';

interface RevenueTrendData {
  month: string;
  revenue: number;
  profit: number;
  date: string;
}

interface RevenueTrendChartProps {
  data?: RevenueTrendData[];
  title?: string;
  showExport?: boolean;
  showGradient?: boolean;
  height?: number;
  dateRange?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-48">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}:</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 ml-3">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenueTrendChart({
  data = generateMockChartData('revenue'),
  title = 'Revenue Trend',
  showExport = true,
  showGradient = true,
  height = 400,
  dateRange = 'Last 12 months',
}: RevenueTrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedView, setSelectedView] = useState<'line' | 'area'>('line');

  // Calculate growth metrics
  const currentRevenue = data[data.length - 1]?.revenue || 0;
  const previousRevenue = data[data.length - 2]?.revenue || 0;
  const revenueChange = calculatePercentageChange(currentRevenue, previousRevenue);

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const avgRevenue = totalRevenue / data.length;

  const handleExportPNG = async () => {
    if (!chartRef.current) return;

    try {
      setIsExporting(true);
      await exportChartAsPNG(chartRef.current, {
        filename: 'revenue-trend-chart',
        title,
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    exportChartAsCSV(data, {
      filename: 'revenue-trend-data',
      title: `${title} - ${dateRange}`,
    });
  };

  const renderChart = () => {
    if (selectedView === 'area' && showGradient) {
      return (
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.categorical.revenue} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.categorical.revenue} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.categorical.growth} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColors.categorical.growth} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
            axisLine={{ stroke: '#e0e0e0' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartColors.categorical.revenue}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            strokeWidth={3}
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke={chartColors.categorical.growth}
            fillOpacity={1}
            fill="url(#profitGradient)"
            strokeWidth={2}
            name="Profit"
          />
        </AreaChart>
      );
    }

    return (
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e0e0e0' }}
          axisLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis
          tickFormatter={(value) => formatCurrency(value).replace('.00', '')}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: '#e0e0e0' }}
          axisLine={{ stroke: '#e0e0e0' }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke={chartColors.categorical.revenue}
          strokeWidth={3}
          dot={{ fill: chartColors.categorical.revenue, strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, stroke: chartColors.categorical.revenue, strokeWidth: 2, fill: '#fff' }}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke={chartColors.categorical.growth}
          strokeWidth={2}
          dot={{ fill: chartColors.categorical.growth, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: chartColors.categorical.growth, strokeWidth: 2, fill: '#fff' }}
          name="Profit"
        />
      </LineChart>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-3 sm:mb-0">
            <Calendar className="h-4 w-4 mr-1" />
            {dateRange}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Metrics */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Total Revenue</div>
              <div className="font-semibold text-gray-900">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Total Profit</div>
              <div className="font-semibold text-gray-900">{formatCurrency(totalProfit)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Growth</div>
              <div className={`font-semibold flex items-center ${
                revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {revenueChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(revenueChange).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedView('line')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  selectedView === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setSelectedView('area')}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  selectedView === 'area'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Area
              </button>
            </div>

            {/* Export Dropdown */}
            {showExport && (
              <div className="relative group">
                <button
                  disabled={isExporting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={handleExportPNG}
                    disabled={isExporting}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Image className="h-4 w-4 mr-3" />
                    Export as PNG
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-3" />
                    Export as CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
