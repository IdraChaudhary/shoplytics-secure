import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';

// Interface for dashboard metrics
interface DashboardMetrics {
  customers: number;
  products: number;
  orders: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
  lastUpdated: string;
}

// Interface for real-time analytics data
interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>;
  customerSegments: Array<{ segment: string; count: number; value: number }>;
  trafficSources: Array<{ source: string; visitors: number; conversions: number }>;
  lastSync: string;
}

// Interface for notifications
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{ label: string; action: () => void }>;
}

// Interface for system alerts
interface SystemAlert {
  id: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

// Interface for user preferences
interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  timezone: string;
  dateFormat: string;
  refreshInterval: number;
  notifications: {
    email: boolean;
    push: boolean;
    alerts: boolean;
    reports: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    widgets: Array<{ id: string; position: number; visible: boolean }>;
  };
}

// Main store interface
interface ShoplyticsStore {
  // Dashboard state
  dashboardMetrics: DashboardMetrics | null;
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  
  // Real-time features
  notifications: Notification[];
  systemAlerts: SystemAlert[];
  unreadCount: number;
  
  // User preferences
  preferences: UserPreferences;
  
  // Connection status
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastSync: string | null;
  
  // Actions for dashboard
  setDashboardMetrics: (metrics: DashboardMetrics) => void;
  setAnalyticsData: (data: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions for notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actions for system alerts
  addSystemAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp'>) => void;
  resolveSystemAlert: (id: string) => void;
  clearResolvedAlerts: () => void;
  
  // Actions for preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  
  // Actions for connection
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void;
  updateLastSync: () => void;
  
  // Reactive data refresh
  refreshData: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'auto',
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',
  refreshInterval: 30000, // 30 seconds
  notifications: {
    email: true,
    push: true,
    alerts: true,
    reports: true,
  },
  dashboard: {
    layout: 'grid',
    widgets: [
      { id: 'metrics', position: 1, visible: true },
      { id: 'revenue-chart', position: 2, visible: true },
      { id: 'top-products', position: 3, visible: true },
      { id: 'customer-segments', position: 4, visible: true },
      { id: 'traffic-sources', position: 5, visible: true },
    ],
  },
};

// Create the Zustand store with persistence and reactivity
export const useShoplyticsStore = create<ShoplyticsStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        dashboardMetrics: null,
        analyticsData: null,
        isLoading: false,
        error: null,
        notifications: [],
        systemAlerts: [],
        unreadCount: 0,
        preferences: defaultPreferences,
        connectionStatus: 'disconnected',
        lastSync: null,
        
        // Dashboard actions
        setDashboardMetrics: (metrics) => {
          set({ dashboardMetrics: metrics });
          get().updateLastSync();
        },
        
        setAnalyticsData: (data) => {
          set({ analyticsData: data });
          get().updateLastSync();
        },
        
        setLoading: (loading) => set({ isLoading: loading }),
        
        setError: (error) => {
          set({ error });
          if (error) {
            get().addNotification({
              type: 'error',
              title: 'Error',
              message: error,
              read: false,
            });
          }
        },
        
        // Notification actions
        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date().toISOString(),
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep only 50 most recent
            unreadCount: state.unreadCount + 1,
          }));
        },
        
        removeNotification: (id) =>
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            const wasUnread = notification && !notification.read;
            
            return {
              notifications: state.notifications.filter(n => n.id !== id),
              unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
            };
          }),
        
        markNotificationRead: (id) =>
          set((state) => {
            const notification = state.notifications.find(n => n.id === id);
            if (!notification || notification.read) return state;
            
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: state.unreadCount - 1,
            };
          }),
        
        clearAllNotifications: () =>
          set({ notifications: [], unreadCount: 0 }),
        
        // System alert actions
        addSystemAlert: (alert) => {
          const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newAlert: SystemAlert = {
            ...alert,
            id,
            timestamp: new Date().toISOString(),
          };
          
          set((state) => ({
            systemAlerts: [newAlert, ...state.systemAlerts],
          }));
          
          // Also add as notification
          get().addNotification({
            type: alert.level === 'critical' ? 'error' : 'warning',
            title: `System Alert: ${alert.title}`,
            message: alert.description,
            read: false,
          });
        },
        
        resolveSystemAlert: (id) =>
          set((state) => ({
            systemAlerts: state.systemAlerts.map(alert =>
              alert.id === id ? { ...alert, resolved: true } : alert
            ),
          })),
        
        clearResolvedAlerts: () =>
          set((state) => ({
            systemAlerts: state.systemAlerts.filter(alert => !alert.resolved),
          })),
        
        // Preference actions
        updatePreferences: (newPreferences) =>
          set((state) => ({
            preferences: { ...state.preferences, ...newPreferences },
          })),
        
        // Connection actions
        setConnectionStatus: (status) => {
          set({ connectionStatus: status });
          
          if (status === 'connected') {
            get().addNotification({
              type: 'success',
              title: 'Connected',
              message: 'Successfully connected to your Shopify store',
              read: false,
            });
          } else if (status === 'disconnected') {
            get().addNotification({
              type: 'warning',
              title: 'Disconnected',
              message: 'Connection to Shopify store lost. Attempting to reconnect...',
              read: false,
            });
          }
        },
        
        updateLastSync: () => set({ lastSync: new Date().toISOString() }),
        
        // Data refresh
        refreshData: async () => {
          const state = get();
          state.setLoading(true);
          state.setError(null);
          
          try {
            // Simulate API calls - replace with actual API calls
            const [metricsResponse, analyticsResponse] = await Promise.all([
              fetch('/api/dashboard/metrics'),
              fetch('/api/dashboard/analytics'),
            ]);
            
            if (!metricsResponse.ok || !analyticsResponse.ok) {
              throw new Error('Failed to fetch data');
            }
            
            const metrics = await metricsResponse.json();
            const analytics = await analyticsResponse.json();
            
            state.setDashboardMetrics(metrics);
            state.setAnalyticsData(analytics);
            state.setConnectionStatus('connected');
            
          } catch (error) {
            console.error('Data refresh failed:', error);
            state.setError(error instanceof Error ? error.message : 'Data refresh failed');
            state.setConnectionStatus('disconnected');
          } finally {
            state.setLoading(false);
          }
        },
        
        // Auto refresh functionality
        startAutoRefresh: () => {
          const { preferences, refreshData } = get();
          
          // Clear any existing interval
          if (typeof window !== 'undefined' && (window as any).shoplyticsRefreshInterval) {
            clearInterval((window as any).shoplyticsRefreshInterval);
          }
          
          // Set new interval
          if (typeof window !== 'undefined') {
            (window as any).shoplyticsRefreshInterval = setInterval(() => {
              refreshData();
            }, preferences.refreshInterval);
          }
        },
        
        stopAutoRefresh: () => {
          if (typeof window !== 'undefined' && (window as any).shoplyticsRefreshInterval) {
            clearInterval((window as any).shoplyticsRefreshInterval);
            delete (window as any).shoplyticsRefreshInterval;
          }
        },
      }),
      {
        name: 'shoplytics-store',
        partialize: (state) => ({
          preferences: state.preferences,
          notifications: state.notifications.filter(n => !n.read).slice(0, 10), // Only persist unread notifications
          systemAlerts: state.systemAlerts.filter(a => !a.resolved).slice(0, 5), // Only persist unresolved alerts
        }),
      }
    )
  )
);

// Selector hooks for better performance
export const useDashboardMetrics = () => useShoplyticsStore((state) => state.dashboardMetrics);
export const useAnalyticsData = () => useShoplyticsStore((state) => state.analyticsData);
export const useNotifications = () => useShoplyticsStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  markNotificationRead: state.markNotificationRead,
  clearAllNotifications: state.clearAllNotifications,
}));

export const useSystemAlerts = () => useShoplyticsStore((state) => ({
  alerts: state.systemAlerts,
  addSystemAlert: state.addSystemAlert,
  resolveSystemAlert: state.resolveSystemAlert,
  clearResolvedAlerts: state.clearResolvedAlerts,
}));

export const useConnectionStatus = () => useShoplyticsStore((state) => ({
  status: state.connectionStatus,
  lastSync: state.lastSync,
  setConnectionStatus: state.setConnectionStatus,
}));

export const usePreferences = () => useShoplyticsStore((state) => ({
  preferences: state.preferences,
  updatePreferences: state.updatePreferences,
}));

// Effect for subscribing to store changes
export const subscribeToStoreChanges = () => {
  // Subscribe to metrics changes for alerts
  useShoplyticsStore.subscribe(
    (state) => state.dashboardMetrics,
    (metrics) => {
      if (!metrics) return;
      
      const { addSystemAlert } = useShoplyticsStore.getState();
      
      // Example alert conditions
      if (metrics.conversionRate < 2.0) {
        addSystemAlert({
          level: 'medium',
          title: 'Low Conversion Rate',
          description: `Conversion rate has dropped to ${metrics.conversionRate.toFixed(2)}%`,
          metric: 'conversionRate',
          threshold: 2.0,
          currentValue: metrics.conversionRate,
          resolved: false,
        });
      }
      
      if (metrics.revenue > 0 && metrics.avgOrderValue < 50) {
        addSystemAlert({
          level: 'low',
          title: 'Low Average Order Value',
          description: `Average order value is $${metrics.avgOrderValue.toFixed(2)}`,
          metric: 'avgOrderValue',
          threshold: 50,
          currentValue: metrics.avgOrderValue,
          resolved: false,
        });
      }
    },
    { fireImmediately: false }
  );
};
