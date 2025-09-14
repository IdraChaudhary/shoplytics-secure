'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  loading = false,
  onClick,
  className = '',
}) => {
  const displayValue = React.useMemo(() => {
    if (typeof value === 'number') {
      if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('value')) {
        return formatCurrency(value);
      }
      return formatNumber(value);
    }
    return value;
  }, [value, title]);

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 ${className}`}>
        <div className="p-5">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
            {change && (
              <div className="mt-3 flex items-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </motion.div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <motion.div
                  key={displayValue}
                  initial={{ scale: 1.2, color: '#3B82F6' }}
                  animate={{ scale: 1, color: '#111827' }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-semibold text-gray-900"
                >
                  {displayValue}
                </motion.div>
                {change && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-2 flex items-baseline text-sm"
                  >
                    {(() => {
                      const TrendIcon = getTrendIcon(change.trend);
                      return TrendIcon ? (
                        <TrendIcon className={`self-center flex-shrink-0 h-3 w-3 ${getTrendColor(change.trend)}`} />
                      ) : null;
                    })()}
                    <span className={`ml-1 ${getTrendColor(change.trend)}`}>
                      {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(1)}%
                    </span>
                    <span className="ml-1 text-gray-500">vs {change.period}</span>
                  </motion.div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        
        {change && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-100"
          >
            <div className="text-xs text-gray-600">
              <span className={`font-medium ${getTrendColor(change.trend)}`}>
                {change.value > 0 ? '+' : ''}{formatNumber(change.value)}
              </span>
              <span className="ml-1">change from {change.period}</span>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 pointer-events-none"
        whileHover={{ opacity: 0.05 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export default MetricCard;
