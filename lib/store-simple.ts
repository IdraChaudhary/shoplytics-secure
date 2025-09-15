import { create } from 'zustand'

interface DashboardMetrics {
  customers: number
  products: number
  orders: number
  revenue: number
  conversionRate: number
  avgOrderValue: number
  lastUpdated: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
  timestamp: string
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  resolved: boolean
  timestamp: string
}

interface ShoplyticsStore {
  // Dashboard Metrics
  dashboardMetrics: DashboardMetrics | null
  isLoading: boolean
  error: string | null
  
  // Notifications
  notifications: Notification[]
  alerts: SystemAlert[]
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  
  // Actions
  setDashboardMetrics: (metrics: DashboardMetrics) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markNotificationAsRead: (id: string) => void
  addAlert: (alert: Omit<SystemAlert, 'id' | 'timestamp'>) => void
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'reconnecting') => void
  refreshData: () => void
  startAutoRefresh: () => void
  stopAutoRefresh: () => void
}

export const useShoplyticsStore = create<ShoplyticsStore>((set, get) => ({
  // Initial state
  dashboardMetrics: null,
  isLoading: false,
  error: null,
  notifications: [],
  alerts: [],
  connectionStatus: 'connected',
  
  // Actions
  setDashboardMetrics: (metrics) => set({ dashboardMetrics: metrics }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...notification
    }, ...state.notifications]
  })),
  
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  addAlert: (alert) => set((state) => ({
    alerts: [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      ...alert
    }, ...state.alerts]
  })),
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  refreshData: () => {
    set({ isLoading: true })
    // Mock data refresh
    setTimeout(() => {
      const mockMetrics: DashboardMetrics = {
        customers: 1247 + Math.floor(Math.random() * 10),
        products: 89 + Math.floor(Math.random() * 5),
        orders: 342 + Math.floor(Math.random() * 20),
        revenue: 45620.50 + Math.random() * 1000,
        conversionRate: 2.3 + Math.random() * 2,
        avgOrderValue: 133.45 + Math.random() * 50,
        lastUpdated: new Date().toISOString()
      }
      set({ dashboardMetrics: mockMetrics, isLoading: false })
    }, 1000)
  },
  
  startAutoRefresh: () => {
    // Mock auto-refresh (in real app, this would set up intervals)
    console.log('Auto-refresh started')
  },
  
  stopAutoRefresh: () => {
    console.log('Auto-refresh stopped')
  }
}))

export const useDashboardMetrics = () => useShoplyticsStore((state) => state.dashboardMetrics)
export const useNotifications = () => useShoplyticsStore((state) => ({
  notifications: state.notifications,
  addNotification: state.addNotification,
  markAsRead: state.markNotificationAsRead
}))
export const useSystemAlerts = () => useShoplyticsStore((state) => state.alerts)
export const useConnectionStatus = () => useShoplyticsStore((state) => state.connectionStatus)
