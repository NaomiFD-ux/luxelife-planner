import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { HUB_CONFIGS } from '../constants';
import { NotificationPriority, HubType } from '../types';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get priority color
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'text-red-500';
      case NotificationPriority.HIGH:
        return 'text-orange-500';
      case NotificationPriority.MEDIUM:
        return 'text-yellow-500';
      case NotificationPriority.LOW:
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get hub color
  const getHubColor = (hub: HubType) => {
    return HUB_CONFIGS[hub]?.color || '#6366f1';
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-10 rounded-xl bg-background-light dark:bg-background-dark hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-all"
      >
        <span className="material-symbols-outlined text-text-muted">
          notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[80vh] bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-text-main dark:text-white">Notifications</h3>
              <p className="text-xs text-text-muted">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  Mark all read
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={clearAllNotifications}
                  className="text-xs font-medium text-text-muted hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full size-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-700 mb-3">
                  notifications_off
                </span>
                <p className="text-text-muted font-medium">No notifications</p>
                <p className="text-xs text-text-muted mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 size-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${getHubColor(notification.hub)}20` }}
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={{ color: getHubColor(notification.hub) }}
                        >
                          {notification.icon}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm ${!notification.read ? 'text-text-main dark:text-white' : 'text-text-muted'}`}>
                            {notification.title}
                          </p>
                          <span className={`material-symbols-outlined text-sm ${getPriorityColor(notification.priority)}`}>
                            {notification.priority === NotificationPriority.URGENT ? 'priority_high' : 'circle'}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-text-muted">
                            {formatTime(notification.createdAt)}
                          </span>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${getHubColor(notification.hub)}20`,
                              color: getHubColor(notification.hub),
                            }}
                          >
                            {HUB_CONFIGS[notification.hub]?.label || notification.hub}
                          </span>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="flex-shrink-0 size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-text-muted hover:text-red-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    </div>

                    {/* Action Button */}
                    {notification.actionLabel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                        className="mt-3 ml-13 px-4 py-2 text-xs font-bold rounded-lg transition-colors"
                        style={{
                          backgroundColor: `${getHubColor(notification.hub)}15`,
                          color: getHubColor(notification.hub),
                        }}
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => {
                  navigate('/settings#notifications');
                  setIsOpen(false);
                }}
                className="w-full py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                Notification Settings
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
