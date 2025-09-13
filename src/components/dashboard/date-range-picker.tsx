'use client';

import React, { useState } from 'react';
import { DateRange } from '@/types/dashboard';
import { CalendarIcon } from 'lucide-react';
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
      getValue: () => ({
        from: new Date(),
        to: new Date(),
      }),
    },
    {
      label: 'Yesterday',
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
      getValue: () => ({
        from: subDays(new Date(), 7),
        to: new Date(),
      }),
    },
    {
      label: 'Last 30 days',
      getValue: () => ({
        from: subDays(new Date(), 30),
        to: new Date(),
      }),
    },
    {
      label: 'This week',
      getValue: () => ({
        from: startOfWeek(new Date()),
        to: endOfWeek(new Date()),
      }),
    },
    {
      label: 'This month',
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
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <CalendarIcon className="w-4 h-4" />
        <span>{formatDateRange(value)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Quick select
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Custom range
                </h4>
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

              <div className="flex justify-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
