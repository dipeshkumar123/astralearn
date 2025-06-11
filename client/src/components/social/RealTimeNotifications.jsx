/**
 * Real-time Notifications Component
 * Displays live notifications for social learning activities
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';
import realTimeIntegrationService from '../../services/realTimeIntegrationService';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss logic for notifications
  useEffect(() => {
    const timers = [];
    
    notifications.forEach(notification => {
      if (notification.autoDismiss !== false) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);
        
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  // NotificationItem component for displaying individual notifications
  const NotificationItem = ({ notification, onDismiss }) => {
    // Auto-dismiss logic for individual notifications
    useEffect(() => {
      if (notification.autoDismiss !== false) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    }, [notification, onDismiss]);

    return (
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`p-4 rounded-lg border-l-4 shadow-lg backdrop-blur-sm bg-white/90 ${getNotificationBgColor(notification.type)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    // Setup real-time notification listeners
    realTimeIntegrationService.on('realTimeNotification', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          ...data,
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 5)); // Keep latest 5 notifications
    });

    realTimeIntegrationService.on('socialAchievementUnlocked', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'achievement',
          title: 'Achievement Unlocked! 🏆',
          message: data.achievement.name,
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 5));
    });

    realTimeIntegrationService.on('socialInteractionNotification', (data) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'interaction',
          title: data.title,
          message: data.message,
          timestamp: new Date().toISOString()
        },
        ...prev
      ].slice(0, 5));
    });

    return () => {
      realTimeIntegrationService.off('realTimeNotification');
      realTimeIntegrationService.off('socialAchievementUnlocked');
      realTimeIntegrationService.off('socialInteractionNotification');
    };
  }, []);

  // Auto-dismiss logic implementation
  const setupAutoDismiss = (notification) => {
    if (notification.autoDismiss !== false) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration || 5000);
    }
  };

  // Auto-dismiss setup for new notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.autoDismissSetup) {
        setupAutoDismiss(notification);
        notification.autoDismissSetup = true;
      }
    });
  }, [notifications]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'achievement':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'interaction':
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'interaction':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>

      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <button
            onClick={() => setNotifications([])}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all notifications
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeNotifications;
