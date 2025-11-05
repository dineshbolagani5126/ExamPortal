import { useState, useEffect } from 'react';
import { FaBell, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../utils/api';
import { formatDateTime, getRelativeTime } from '../../utils/helpers';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === 'all' ? {} : { isRead: filter === 'read' };
      const { data } = await getNotifications(params);
      setNotifications(data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FaCheckDouble />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'unread', 'read'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card hover:shadow-lg transition-shadow cursor-pointer ${
                !notification.isRead ? 'border-l-4 border-primary-500 bg-primary-50' : ''
              }`}
              onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FaBell className={notification.isRead ? 'text-gray-400' : 'text-primary-600'} />
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <span className={`badge ${
                      notification.priority === 'high' ? 'badge-danger' :
                      notification.priority === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {notification.priority}
                    </span>
                    {!notification.isRead && (
                      <span className="badge badge-primary">New</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{notification.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{getRelativeTime(notification.createdAt)}</span>
                    <span>•</span>
                    <span className="capitalize">{notification.type}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification._id);
                  }}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <FaBell size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
