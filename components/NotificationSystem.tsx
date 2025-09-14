'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications, useSystemAlerts, useConnectionStatus } from '@/lib/store';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationToastProps {
  notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  };
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onDismiss, 
  onMarkRead 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (!notification.read) {
        onMarkRead(notification.id);
      }
      onDismiss(notification.id);
    }, 200);
  };

  useEffect(() => {
    // Auto-dismiss after 5 seconds for non-error notifications
    if (notification.type !== 'error') {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.type]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${getBackgroundColor()}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon()}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleDismiss}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConnectionStatus: React.FC = () => {
  const { status, lastSync } = useConnectionStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'reconnecting':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className={`h-4 w-4 ${getStatusColor()}`} />;
      case 'reconnecting':
        return <Clock className={`h-4 w-4 ${getStatusColor()}`} />;
      default:
        return <WifiOff className={`h-4 w-4 ${getStatusColor()}`} />;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      {getStatusIcon()}
      <span className={`capitalize ${getStatusColor()}`}>
        {status}
      </span>
      {lastSync && (
        <span className="text-gray-500">
          • Last sync: {new Date(lastSync).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markNotificationRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b">
              Notifications ({unreadCount} unread)
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-gray-500 text-center">
                No notifications
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SystemAlertsPanel: React.FC = () => {
  const { alerts, resolveSystemAlert } = useSystemAlerts();
  const activeAlerts = alerts.filter(alert => !alert.resolved);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            System Alerts ({activeAlerts.length})
          </h3>
          <div className="mt-2 space-y-2">
            {activeAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    <strong>{alert.title}</strong>: {alert.description}
                  </p>
                  <p className="text-xs text-yellow-600">
                    Current: {alert.currentValue} | Threshold: {alert.threshold}
                  </p>
                </div>
                <button
                  onClick={() => resolveSystemAlert(alert.id)}
                  className="ml-2 text-xs text-yellow-800 hover:text-yellow-900 underline"
                >
                  Resolve
                </button>
              </div>
            ))}
            {activeAlerts.length > 3 && (
              <p className="text-xs text-yellow-700">
                ...and {activeAlerts.length - 3} more alerts
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification, markNotificationRead } = useNotifications();
  const recentNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 3)
    .filter(n => {
      const notificationTime = new Date(n.timestamp).getTime();
      const now = Date.now();
      return now - notificationTime < 30000; // Show notifications from last 30 seconds
    });

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-4 pointer-events-none">
        <AnimatePresence>
          {recentNotifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onDismiss={removeNotification}
              onMarkRead={markNotificationRead}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Connection Status */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-3 py-2">
          <ConnectionStatus />
        </div>
      </div>
    </>
  );
};

export default NotificationSystem;
export { NotificationBell, SystemAlertsPanel, ConnectionStatus };
