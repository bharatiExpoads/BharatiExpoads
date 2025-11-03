import React, { useState, useEffect } from 'react';
import { AiOutlineTeam, AiOutlineDatabase, AiOutlineFileText, AiOutlineBank } from 'react-icons/ai';
import { BsMegaphone } from 'react-icons/bs';
import { FaTasks } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EmployeeLayout from '../components/EmployeeLayout';
import useAuth from '../hooks/useAuth';
import { fetchWithAuth } from '../services/api';
import { getMyPermissions } from '../services/masterService';

// Card component
const DashboardCard = ({ title, icon, description, to, color }) => (
  <Link
    to={to}
    className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-start ${color || ''}`}
  >
    <div className="flex items-center mb-4">{icon}</div>
    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </Link>
);

const EmployeeDashboard1 = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  // Fetch user permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await getMyPermissions();
        setPermissions(data.map(p => p.module));
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
      }
    };
    fetchPermissions();
  }, []);

  // Fetch assigned campaigns
  useEffect(() => {
    const fetchAssignedCampaigns = async () => {
      try {
        setLoading(true);
        const data = await fetchWithAuth('/admin/assigned');
        console.log('Assigned campaigns fetched:', data);
        setCampaigns(data || []);
      } catch (err) {
        console.error('Failed to fetch assigned campaigns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedCampaigns();
  }, []);

  // Fetch assigned tasks
  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setTasksLoading(true);
        const data = await fetchWithAuth('/admin/tasks');
        console.log('Assigned tasks fetched:', data);
        setTasks(data || []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchMyTasks();
  }, []);

  const hasModule = module => permissions.includes(module);

  // Filter campaigns based on search
  const filteredCampaigns = campaigns.filter(c =>
    c.campaignNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    c.status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <EmployeeLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome, {user?.name}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your modules from your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {hasModule('Masters') && (
            <DashboardCard
              title="Master Data"
              icon={<AiOutlineDatabase className="h-6 w-6 text-green-600" />}
              description="Access master forms"
              to="/masters"
              color="bg-green-50"
            />
          )}

          {hasModule('Campaigns') && (
            <DashboardCard
              title="Campaigns"
              icon={<BsMegaphone className="h-6 w-6 text-yellow-600" />}
              description="View and manage campaigns"
              to="/campaigns"
              color="bg-yellow-50"
            />
          )}

          {hasModule('Vouchers') && (
            <DashboardCard
              title="Vouchers"
              icon={<AiOutlineFileText className="h-6 w-6 text-blue-600" />}
              description="Create and view vouchers"
              to="/vouchers"
              color="bg-blue-50"
            />
          )}

          {hasModule('Accounts') && (
            <DashboardCard
              title="Accounts"
              icon={<AiOutlineBank className="h-6 w-6 text-purple-600" />}
              description="View account records"
              to="/accounts"
              color="bg-purple-50"
            />
          )}

          {/* Task Management - Always visible for employees */}
          <DashboardCard
            title="My Tasks"
            icon={<FaTasks className="h-6 w-6 text-indigo-600" />}
            description="View and update your assigned tasks"
            to="/employee/tasks"
            color="bg-indigo-50"
          />
        </div>

        {/* My Tasks Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My Assigned Tasks</h3>
            <Link
              to="/employee/tasks"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Tasks →
            </Link>
          </div>

          {tasksLoading ? (
            <p className="text-gray-500">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned to you yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
                const priorityColors = {
                  URGENT: 'bg-red-100 text-red-800',
                  HIGH: 'bg-orange-100 text-orange-800',
                  MEDIUM: 'bg-yellow-100 text-yellow-800',
                  LOW: 'bg-blue-100 text-blue-800'
                };
                const statusColors = {
                  TODO: 'bg-gray-100 text-gray-800',
                  IN_PROGRESS: 'bg-blue-100 text-blue-800',
                  IN_REVIEW: 'bg-purple-100 text-purple-800',
                  COMPLETED: 'bg-green-100 text-green-800',
                  CANCELLED: 'bg-red-100 text-red-800'
                };

                return (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description.substring(0, 100)}...</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              ⚠️ OVERDUE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {task.dueDate && (
                          <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {tasks.length > 5 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  + {tasks.length - 5} more tasks
                </p>
              )}
            </div>
          )}
        </div>

        {hasModule('Campaigns') && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Assigned Campaigns</h3>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 mb-4 w-full"
            />

            {loading ? (
              <p>Loading campaigns...</p>
            ) : filteredCampaigns.length === 0 ? (
              <p>No campaigns assigned.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Campaign Number</th>
                      <th className="py-2 px-4 border-b">Customer Name</th>
                      <th className="py-2 px-4 border-b">Phone</th>
                      <th className="py-2 px-4 border-b">Start Date</th>
                      <th className="py-2 px-4 border-b">End Date</th>
                      <th className="py-2 px-4 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.map(c => (
                      <tr key={c.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">{c.campaignNumber}</td>
                        <td className="py-2 px-4 border-b">{c.customerName}</td>
                        <td className="py-2 px-4 border-b">{c.phoneNumber}</td>
                        <td className="py-2 px-4 border-b">{c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-2 px-4 border-b">{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-2 px-4 border-b">{c.status || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard1;
