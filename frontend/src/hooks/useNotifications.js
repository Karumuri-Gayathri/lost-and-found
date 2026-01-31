import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';

export const useNotifications = (autoFetch = true) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch notifications (guarded to run only once even if StrictMode mounts twice)
  const didFetchRef = useRef(false);
  useEffect(() => {
    if (!autoFetch) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications', {
        params: { limit: 50 } // Fetch more for the badge
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await axiosInstance.put(
        `/api/notifications/${notificationId}/read`
      );

      if (response.data.success) {
        setNotifications(
          notifications.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put(
        '/api/notifications/read-all'
      );

      if (response.data.success) {
        setNotifications(
          notifications.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/notifications/${notificationId}`
      );

      if (response.data.success) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(
          notifications.filter(n => n._id !== notificationId)
        );
        // Update unread count if deleted was unread
        if (deleted && !deleted.isRead) {
          setUnreadCount(Math.max(0, unreadCount - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

export default useNotifications;
