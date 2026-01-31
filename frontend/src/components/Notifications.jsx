import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch notifications from backend
  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/notifications', {
        params: { page, limit: 10 }
      });

      if (response.data.success) {
        setNotifications(response.data.data);
        setTotalPages(response.data.totalPages);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await axiosInstance.put(
        `/api/notifications/${notificationId}/read`
      );

      if (response.data.success) {
        // Update local state
        setNotifications(
          notifications.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // View the found item details
  const handleViewItem = (notificationId, itemId) => {
    // Mark as read and navigate
    handleMarkAsRead(notificationId);
    navigate(`/item/${itemId}`);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await axiosInstance.put(
        '/api/notifications/read-all'
      );

      if (response.data.success) {
        // Update all notifications to read
        setNotifications(
          notifications.map(n => ({ ...n, isRead: true }))
        );
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/notifications/${notificationId}`
      );

      if (response.data.success) {
        setNotifications(
          notifications.filter(n => n._id !== notificationId)
        );
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-2">
            You'll see notifications here when items match your lost items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Notifications list */}
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-6 hover:bg-gray-50 transition ${
              !notification.isRead ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Message with unread indicator */}
                <div className="flex items-start gap-2">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`${
                        !notification.isRead
                          ? 'font-semibold text-gray-900'
                          : 'font-normal text-gray-700'
                      }`}
                    >
                      {notification.message}
                    </p>

                    {/* Item details */}
                    {notification.item && (
                      <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.item.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.item.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {notification.item.location}
                        </p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex-shrink-0 ml-4 flex gap-2">
                <button
                  onClick={() =>
                    handleViewItem(
                      notification._id,
                      notification.item._id
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition"
                >
                  View Item
                </button>
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Mark as read button for unread notifications */}
            {!notification.isRead && (
              <button
                onClick={() => handleMarkAsRead(notification._id)}
                className="mt-3 text-xs text-gray-600 hover:text-gray-900 underline"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              page === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
