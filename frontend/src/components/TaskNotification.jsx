import React, { useState, useEffect } from 'react';
import { FaBell, FaTimes, FaTasks, FaExclamationCircle } from 'react-icons/fa';
import { fetchWithAuth } from '../services/api';

const TaskNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const tasks = await fetchWithAuth('/admin/tasks');
      
      // Get tasks that need attention
      const needsAttention = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        // Show notification for:
        // 1. Overdue tasks
        // 2. Tasks due in 2 days or less
        // 3. Tasks in review status
        return (
          (task.status !== 'COMPLETED' && task.status !== 'CANCELLED') &&
          (daysUntilDue < 0 || daysUntilDue <= 2 || task.status === 'IN_REVIEW')
        );
      });

      setNotifications(needsAttention);
      setUnreadCount(needsAttention.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const getNotificationMessage = (task) => {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} days`;
    } else if (daysUntilDue === 0) {
      return 'Due today!';
    } else if (daysUntilDue <= 2) {
      return `Due in ${daysUntilDue} days`;
    } else if (task.status === 'IN_REVIEW') {
      return 'Waiting for review';
    }
    return 'Needs attention';
  };

  const getNotificationColor = (task) => {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'bg-red-50 border-red-200';
    if (daysUntilDue === 0) return 'bg-orange-50 border-orange-200';
    if (task.status === 'IN_REVIEW') return 'bg-purple-50 border-purple-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  const dismissNotification = (taskId) => {
    setNotifications(notifications.filter(n => n.id !== taskId));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowNotifications(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaBell className="mr-2" />
                  Task Notifications
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaTasks className="mx-auto mb-2 text-gray-300" size={40} />
                <p>No notifications</p>
                <p className="text-sm mt-1">All tasks are on track!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(task)} border-l-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <FaExclamationCircle className="text-orange-500 mr-2 flex-shrink-0" />
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {getNotificationMessage(task)}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-3">
                            Assigned to: {task.assignedTo?.name || 'Unassigned'}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(task.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    window.location.href = '/admin/tasks';
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Tasks
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskNotification;
