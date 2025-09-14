import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export interface ChartData {
  [key: string]: any;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  includeTitle?: boolean;
  backgroundColor?: string;
}

/**
 * Export chart as PNG image
 */
export const exportChartAsPNG = async (
  chartElement: HTMLElement,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    filename = 'chart-export',
    backgroundColor = '#ffffff',
    includeTitle = true,
    title
  } = options;

  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor,
      scale: 2, // Higher resolution
      logging: false,
      allowTaint: true,
      useCORS: true,
    });

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.png`);
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    throw new Error('Failed to export chart as PNG');
  }
};

/**
 * Export chart data as CSV
 */
export const exportChartAsCSV = (
  data: ChartData[],
  options: ExportOptions = {}
): void => {
  const { filename = 'chart-data', title } = options;

  try {
    // Add title row if specified
    let csvData = data;
    if (title) {
      csvData = [
        { '': title, ...Object.keys(data[0] || {}).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) },
        { '': '', ...Object.keys(data[0] || {}).reduce((acc, key) => ({ ...acc, [key]: '' }), {}) },
        ...data
      ];
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  } catch (error) {
    console.error('Error exporting chart as CSV:', error);
    throw new Error('Failed to export chart as CSV');
  }
};

/**
 * Format currency values for charts
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage values for charts
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

/**
 * Generate date range for charts
 */
export const generateDateRange = (
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'day'
): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));

    switch (interval) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return dates;
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Color palettes for charts
 */
export const chartColors = {
  primary: ['#3B82F6', '#8B5CF6', '#06D6A0', '#F59E0B', '#EF4444', '#10B981'],
  gradient: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  ],
  categorical: {
    revenue: '#3B82F6',
    orders: '#8B5CF6',
    customers: '#06D6A0',
    products: '#F59E0B',
    growth: '#10B981',
    decline: '#EF4444',
  },
};

/**
 * Responsive breakpoints for charts
 */
export const chartBreakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
};

/**
 * Get responsive chart dimensions based on container width
 */
export const getResponsiveChartDimensions = (
  containerWidth: number
): { width: number; height: number } => {
  if (containerWidth <= chartBreakpoints.mobile) {
    return { width: containerWidth - 32, height: 200 };
  }
  if (containerWidth <= chartBreakpoints.tablet) {
    return { width: containerWidth - 48, height: 250 };
  }
  if (containerWidth <= chartBreakpoints.desktop) {
    return { width: containerWidth - 64, height: 300 };
  }
  return { width: containerWidth - 80, height: 350 };
};

/**
 * Custom tooltip formatter for Recharts
 */
export const customTooltipFormatter = (
  value: any,
  name: string,
  props: any,
  type: 'currency' | 'number' | 'percentage' = 'number'
) => {
  let formattedValue = value;

  switch (type) {
    case 'currency':
      formattedValue = formatCurrency(Number(value));
      break;
    case 'percentage':
      formattedValue = formatPercentage(Number(value));
      break;
    case 'number':
      formattedValue = formatNumber(Number(value));
      break;
  }

  return [formattedValue, name];
};

/**
 * Generate mock data for charts (for development/demo purposes)
 */
export const generateMockChartData = (
  type: 'revenue' | 'orders' | 'customers' | 'funnel' | 'products',
  count = 12
): ChartData[] => {
  const data: ChartData[] = [];
  const currentDate = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    switch (type) {
      case 'revenue':
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: Math.floor(Math.random() * 50000) + 20000,
          profit: Math.floor(Math.random() * 15000) + 5000,
          date: date.toISOString(),
        });
        break;

      case 'orders':
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          orders: Math.floor(Math.random() * 500) + 100,
          completed: Math.floor(Math.random() * 400) + 80,
          cancelled: Math.floor(Math.random() * 50) + 10,
          date: date.toISOString(),
        });
        break;

      case 'customers':
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          new: Math.floor(Math.random() * 200) + 50,
          returning: Math.floor(Math.random() * 150) + 30,
          total: Math.floor(Math.random() * 350) + 80,
          date: date.toISOString(),
        });
        break;

      case 'funnel':
        const visitors = 10000 + Math.floor(Math.random() * 5000);
        data.push({
          stage: [
            'Visitors',
            'Product Views',
            'Add to Cart',
            'Checkout',
            'Purchase'
          ][i % 5],
          count: Math.floor(visitors * Math.pow(0.4, i % 5)),
          percentage: 100 * Math.pow(0.4, i % 5),
        });
        break;

      case 'products':
        const products = [
          'Wireless Headphones',
          'Smart Watch',
          'Laptop Stand',
          'Phone Case',
          'USB Cable',
          'Tablet',
          'Keyboard',
          'Mouse',
          'Monitor',
          'Speaker'
        ];
        data.push({
          product: products[i % products.length],
          sales: Math.floor(Math.random() * 1000) + 100,
          revenue: Math.floor(Math.random() * 50000) + 5000,
          growth: (Math.random() - 0.5) * 40,
        });
        break;
    }
  }

  return data;
};

/**
 * Debounce function for resize events
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
