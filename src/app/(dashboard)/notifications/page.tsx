'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: NotificationsResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'want':
        return '💎';
      case 'match':
        return '🎉';
      case 'circle_join':
        return '👋';
      case 'circle_invite':
        return '📩';
      case 'trade_complete':
        return '✅';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-[#FF6B4A] text-lg">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[#FF6B4A] text-sm hover:text-[#E55A41] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-[#8a9a8a] mt-2">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                  !notification.read 
                    ? 'border-l-4 border-l-[#FF6B4A] border-[#dbdbdb]' 
                    : 'border-[#dbdbdb]'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-semibold ${
                        !notification.read ? 'text-gray-900' : 'text-[#8a9a8a]'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-[#FF6B4A] rounded-full"></div>
                        )}
                        <span className="text-xs text-[#8a9a8a] flex-shrink-0">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mt-1 ${
                      !notification.read ? 'text-gray-700' : 'text-[#8a9a8a]'
                    }`}>
                      {notification.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#dbdbdb] border-dashed rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <p className="text-[#8a9a8a] mb-2">No notifications yet</p>
            <p className="text-sm text-[#8a9a8a]">
              When someone wants your items or you get trade matches, you&apos;ll see them here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}