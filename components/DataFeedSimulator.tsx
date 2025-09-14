'use client';

import React, { useEffect, useRef } from 'react';
import { useShoplyticsStore } from '@/lib/store';

interface DataFeedSimulatorProps {
  enabled?: boolean;
  interval?: number;
}

const DataFeedSimulator: React.FC<DataFeedSimulatorProps> = ({ 
  enabled = true, 
  interval = 10000 // 10 seconds 
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { 
    dashboardMetrics, 
    setDashboardMetrics, 
    addNotification, 
    addSystemAlert,
    setConnectionStatus,
    updateLastSync
  } = useShoplyticsStore();

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const simulateDataUpdate = () => {
      if (!dashboardMetrics) return;

      // Create some variation in the data to simulate real updates
      const variations = {
        customers: Math.floor(Math.random() * 20) - 10, // ±10
        products: Math.floor(Math.random() * 6) - 3,    // ±3
        orders: Math.floor(Math.random() * 40) - 20,    // ±20
        revenue: (Math.random() * 2000) - 1000,         // ±1000
        conversionRate: (Math.random() * 1) - 0.5,      // ±0.5%
      };

      const newMetrics = {
        customers: Math.max(0, dashboardMetrics.customers + variations.customers),
        products: Math.max(0, dashboardMetrics.products + variations.products),
        orders: Math.max(0, dashboardMetrics.orders + variations.orders),
        revenue: Math.max(0, dashboardMetrics.revenue + variations.revenue),
        conversionRate: Math.max(0, dashboardMetrics.conversionRate + variations.conversionRate),
        avgOrderValue: Math.max(0, (dashboardMetrics.revenue + variations.revenue) / (dashboardMetrics.orders + variations.orders)),
        lastUpdated: new Date().toISOString(),
      };

      // Update metrics
      setDashboardMetrics(newMetrics);
      updateLastSync();

      // Generate notifications for significant changes
      if (Math.abs(variations.orders) > 15) {
        addNotification({
          type: variations.orders > 0 ? 'success' : 'warning',
          title: `${variations.orders > 0 ? 'Order Surge' : 'Order Drop'}`,
          message: `${variations.orders > 0 ? '+' : ''}${variations.orders} orders in the last update`,
          read: false,
        });
      }

      if (Math.abs(variations.revenue) > 800) {
        addNotification({
          type: variations.revenue > 0 ? 'success' : 'info',
          title: `Revenue ${variations.revenue > 0 ? 'Spike' : 'Dip'}`,
          message: `${variations.revenue > 0 ? '+' : ''}$${variations.revenue.toFixed(0)} revenue change`,
          read: false,
        });
      }

      // Generate system alerts for concerning metrics
      if (newMetrics.conversionRate < 1.5) {
        addSystemAlert({
          level: 'high',
          title: 'Conversion Rate Alert',
          description: `Conversion rate has dropped to ${newMetrics.conversionRate.toFixed(2)}%`,
          metric: 'conversionRate',
          threshold: 1.5,
          currentValue: newMetrics.conversionRate,
          resolved: false,
        });
      }

      if (newMetrics.avgOrderValue < 40) {
        addSystemAlert({
          level: 'medium',
          title: 'Low AOV Warning',
          description: `Average order value is $${newMetrics.avgOrderValue.toFixed(2)}`,
          metric: 'avgOrderValue',
          threshold: 40,
          currentValue: newMetrics.avgOrderValue,
          resolved: false,
        });
      }

      // Simulate occasional connection issues
      const connectionRandom = Math.random();
      if (connectionRandom < 0.02) { // 2% chance
        setConnectionStatus('disconnected');
        setTimeout(() => {
          setConnectionStatus('reconnecting');
          setTimeout(() => {
            setConnectionStatus('connected');
          }, 2000);
        }, 1000);
      }

      console.log('📊 Data feed update:', {
        variations,
        newMetrics: {
          ...newMetrics,
          avgOrderValue: newMetrics.avgOrderValue.toFixed(2),
          conversionRate: newMetrics.conversionRate.toFixed(2),
        }
      });
    };

    // Set up interval
    intervalRef.current = setInterval(simulateDataUpdate, interval);

    // Initial connection status
    setConnectionStatus('connected');

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, dashboardMetrics]);

  // This component doesn't render anything
  return null;
};

export default DataFeedSimulator;
