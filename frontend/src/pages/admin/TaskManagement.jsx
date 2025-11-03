import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../services/api';
import { 
  FaTasks, FaPlus, FaEdit, FaTrash, FaClock, FaExclamationCircle, 
  FaCheckCircle, FaUser, FaCalendar, FaFilter, FaSearch, FaChartBar
} from 'react-icons/fa';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    search: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assignedToId: '',
    campaignId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, employeesData, campaignsData, statsData] = await Promise.all([
        fetchWithAuth('/admin/tasks'),
        fetchWithAuth('/admin/employees'),
        fetchWithAuth('/admin/campaigns'),
        fetchWithAuth('/admin/tasks/stats')
      ]);
      setTasks(tasksData);
      setEmployees(employeesData);
      setCampaigns(campaignsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await fetchWithAuth(`/admin/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        toast.success('Task updated successfully');
      } else {
        await fetchWithAuth('/admin/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        toast.success('Task created successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        assignedToId: '',
        campaignId: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedToId: task.assignedToId || '',
      campaignId: task.campaignId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await fetchWithAuth(`/admin/tasks/${id}`, { method: 'DELETE' });
      toast.success('Task deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      IN_REVIEW: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.TODO;
  };

  const getStatusIcon = (status) => {
    const icons = {
      TODO: FaClock,
      IN_PROGRESS: FaExclamationCircle,
      IN_REVIEW: FaChartBar,
      COMPLETED: FaCheckCircle,
      CANCELLED: FaTrash
    };
    const Icon = icons[status] || FaClock;
    return <Icon className="inline mr-1" />;
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.assignee !== 'all' && task.assignedToId !== filters.assignee) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const isOverdue = (dueDate, status) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && status !== 'COMPLETED';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaTasks className="mr-3 text-blue-600" />
              Task Management
            </h1>
            <p className="text-gray-600 mt-1">Create and assign tasks to your team</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                priority: 'MEDIUM',
                dueDate: '',
                assignedToId: '',
                campaignId: ''
              });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
          >
            <FaPlus /> Create Task
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <StatCard title="Total" value={stats.total} color="blue" />
            <StatCard title="To Do" value={stats.byStatus.todo} color="gray" />
            <StatCard title="In Progress" value={stats.byStatus.inProgress} color="blue" />
            <StatCard title="In Review" value={stats.byStatus.inReview} color="purple" />
            <StatCard title="Completed" value={stats.byStatus.completed} color="green" />
            <StatCard title="Overdue" value={stats.overdue} color="red" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaSearch className="inline mr-1" /> Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search tasks..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={filters.assignee}
                onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Assignees</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">
              {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="divide-y">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaTasks className="mx-auto text-5xl mb-3 text-gray-300" />
                <p>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  isOverdue={isOverdue}
                />
              ))
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <TaskModal
            editingTask={editingTask}
            formData={formData}
            setFormData={setFormData}
            employees={employees}
            campaigns={campaigns}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowModal(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    gray: 'from-gray-500 to-gray-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colors[color]} text-white p-4 rounded-lg shadow-md`}>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, getPriorityColor, getStatusColor, getStatusIcon, isOverdue }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-gray-800">{task.title}</h4>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            {task.status.replace('_', ' ')}
          </span>
          {isOverdue(task.dueDate, task.status) && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
              OVERDUE
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task.assignedTo && (
            <span className="flex items-center">
              <FaUser className="mr-1" /> {task.assignedTo.name}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center">
              <FaCalendar className="mr-1" /> {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.campaign && (
            <span className="text-blue-600">{task.campaign.campaignNumber}</span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(task)}
          className="text-blue-600 hover:text-blue-800 p-2"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-800 p-2"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </div>
);

// Task Modal Component
const TaskModal = ({ editingTask, formData, setFormData, employees, campaigns, onSubmit, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>
      </div>
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Campaign
            </label>
            <select
              value={formData.campaignId}
              onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Campaign</option>
              {campaigns.map(camp => (
                <option key={camp.id} value={camp.id}>
                  {camp.campaignNumber} - {camp.customerName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default TaskManagement;
