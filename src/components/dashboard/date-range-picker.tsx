'use client';

import React, { useState } from 'react';
import { DateRange } from '@/types/dashboard';
import { CalendarIcon, ShoppingCartIcon, TrendingUpIcon } from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    {
      label: 'Today',
      description: 'Today\'s sales',
      icon: '🛍️',
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: 'Yesterday',
      description: 'Previous day',
      icon: '📊',
      getValue: () => {
        const yesterday = subDays(new Date(), 1);
        return {
          from: yesterday,
          to: yesterday,
        };
      },
    },
    {
      label: 'Last 7 days',
      description: 'Weekly trends',
      icon: '📈',
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      description: 'Monthly performance',
      icon: '📅',
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      label: 'This week',
      description: 'Current week',
      icon: '🗓️',
      getValue: () => ({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date()),
      }),
    },
    {
      label: 'This month',
      description: 'Current month',
      icon: '🎯',
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
  ];

  const formatDateRange = (range: DateRange) => {
    if (range.from.toDateString() === range.to.toDateString()) {
      return format(range.from, 'MMM dd, yyyy');
    }
    return `${format(range.from, 'MMM dd, yyyy')} - ${format(range.to, 'MMM dd, yyyy')}`;
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    const newRange = preset.getValue();
    onChange(newRange);
    setIsOpen(false);
  };

  const handleCustomDateChange = (field: 'from' | 'to', dateStr: string) => {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      onChange({
        ...value,
        [field]: date,
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 min-w-[280px]"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
          <CalendarIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold">{formatDateRange(value)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">📊 Sales period</div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                    <ShoppingCartIcon className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Sales Period
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-lg transition-all duration-200 text-left group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{preset.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</div>
                      </div>
                      <TrendingUpIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="flex items-center mb-4">
                  <span className="text-lg mr-2">🎯</span>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Custom Date Range
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={format(value.from, 'yyyy-MM-dd')}
                      onChange={(e) => handleCustomDateChange('from', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={format(value.to, 'yyyy-MM-dd')}
                      onChange={(e) => handleCustomDateChange('to', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <span className="mr-1">📊</span>
                  Analytics will update automatically
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
