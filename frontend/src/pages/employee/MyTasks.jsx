import React, { useState, useEffect } from 'react';
import { 
  FaTasks, FaFilter, FaPlus, FaEdit, FaCheck, FaClock, 
  FaExclamationTriangle, FaComments, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import Layout from '../../components/Layout';
import { fetchWithAuth } from '../../services/api';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    comment: ''
  });
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !updateForm.status) {
      alert('Please select a status');
      return;
    }

    try {
      await fetchWithAuth(`/admin/tasks/${selectedTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: updateForm.status })
      });

      if (updateForm.comment.trim()) {
        await fetchWithAuth(`/admin/tasks/${selectedTask.id}/updates`, {
          method: 'POST',
          body: JSON.stringify({ comment: updateForm.comment })
        });
      }

      await fetchTasks();
      setShowUpdateModal(false);
      setUpdateForm({ status: '', comment: '' });
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setUpdateForm({ status: task.status, comment: '' });
    setShowUpdateModal(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      URGENT: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800 border-gray-200',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
      IN_REVIEW: 'bg-purple-100 text-purple-800 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.TODO;
  };

  const getStatusIcon = (status) => {
    const icons = {
      TODO: <FaClock className="inline mr-1" />,
      IN_PROGRESS: <FaEdit className="inline mr-1" />,
      IN_REVIEW: <FaExclamationTriangle className="inline mr-1" />,
      COMPLETED: <FaCheck className="inline mr-1" />,
      CANCELLED: <FaExclamationTriangle className="inline mr-1" />
    };
    return icons[status] || icons.TODO;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const tasksByStatus = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    IN_REVIEW: filteredTasks.filter(t => t.status === 'IN_REVIEW'),
    COMPLETED: filteredTasks.filter(t => t.status === 'COMPLETED')
  };

  const toggleTaskExpand = (taskId) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FaTasks className="mr-3" />
                My Tasks
              </h1>
              <p className="mt-2 text-blue-100">
                View and update your assigned tasks
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{filteredTasks.length}</div>
              <div className="text-blue-100">Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <FaFilter className="text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Status Columns */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    {getStatusIcon(status)}
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs font-bold">
                    {statusTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
                    >
                      <div onClick={() => toggleTaskExpand(task.id)}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm flex-1">
                            {task.title}
                          </h4>
                          {expandedTask === task.id ? (
                            <FaChevronUp className="text-gray-400 ml-2 flex-shrink-0" />
                          ) : (
                            <FaChevronDown className="text-gray-400 ml-2 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-500 text-white">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-gray-600 mb-2">
                          <div>Due: {formatDate(task.dueDate)}</div>
                          {task.campaign && (
                            <div className="mt-1">Campaign: {task.campaign.name}</div>
                          )}
                          {task.createdBy && (
                            <div className="mt-1">Created by: {task.createdBy.name}</div>
                          )}
                        </div>
                      </div>

                      {expandedTask === task.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700 mb-3">
                            {task.description || 'No description'}
                          </p>

                          {task.updates && task.updates.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                                <FaComments className="mr-1" />
                                Updates ({task.updates.length})
                              </h5>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {task.updates.map((update) => (
                                  <div key={update.id} className="bg-gray-50 rounded p-2 text-xs">
                                    <div className="font-medium text-gray-700">
                                      {update.user.name}
                                    </div>
                                    <div className="text-gray-600">{update.comment}</div>
                                    <div className="text-gray-400 text-xs mt-1">
                                      {new Date(update.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUpdateModal(task);
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                          >
                            <FaEdit className="mr-2" />
                            Update Task
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Task Modal */}
        {showUpdateModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Update Task
                </h2>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700">{selectedTask.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={updateForm.comment}
                    onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                    placeholder="Add an update comment..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedTask(null);
                      setUpdateForm({ status: '', comment: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateTask}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Update Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTasks;
