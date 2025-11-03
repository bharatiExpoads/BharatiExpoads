import React, { useState, useEffect } from 'react';
import { 
  AiOutlineUser, AiOutlineUserAdd, AiOutlineLogout, 
  AiOutlineCheck, AiOutlineClose, AiOutlineDelete,
  AiOutlineClockCircle, AiOutlineSearch, AiOutlineDashboard, AiOutlineTeam, AiOutlineDatabase, AiOutlineShop, AiOutlineApartment
} from 'react-icons/ai';
import { FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import Layout from '../components/Layout';

// Employee creation modal component
const EmployeeCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      setErrors({ ...errors, submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create New Employee</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <AiOutlineClose className="w-6 h-6" />
          </button>
        </div>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="Employee Name"
            />
            {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="employee@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`shadow appearance-none border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              placeholder="********"
            />
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <AiOutlineUserAdd className="mr-2" />
                  Create Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, employee }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(employee.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Delete Employee</h2>
        <p className="mb-6">
          Are you sure you want to delete {employee.name}? This action cannot be undone.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <AiOutlineDelete className="mr-2" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  let bgColor, textColor, icon, label;
  
  switch (status) {
    case 'ACTIVE':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <AiOutlineCheck className="mr-1" />;
      label = 'Approved';
      break;
    case 'PENDING':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = <AiOutlineClockCircle className="mr-1" />;
      label = 'Pending';
      break;
    case 'INACTIVE':
    case 'REJECTED':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <AiOutlineClose className="mr-1" />;
      label = status === 'INACTIVE' ? 'Blocked' : 'Rejected';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = null;
      label = status;
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {label}
    </span>
  );
};

const DashboardCard = ({ title, icon, count, description, to, color }) => (
  <Link to={to} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 ${color || 'bg-blue-100'} rounded-full`}>
        {icon}
      </div>
      <h3 className="text-3xl font-bold">{count}</h3>
    </div>
    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
  </Link>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await authService.getEmployees();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Employee management functions
  const handleCreateEmployee = async (employeeData) => {
    try {
      const newEmployee = await authService.createEmployee(employeeData);
      setEmployees([newEmployee, ...employees]);
      return newEmployee;
    } catch (error) {
      console.error("Failed to create employee:", error);
      throw error;
    }
  };

  const handleStatusChange = async (employeeId, action) => {
    try {
      let updatedEmployee;
      
      if (action === 'approve') {
        updatedEmployee = await authService.approveEmployee(employeeId);
      } else if (action === 'reject') {
        updatedEmployee = await authService.rejectEmployee(employeeId);
      } else if (action === 'deactivate') {
        updatedEmployee = await authService.deactivateEmployee(employeeId);
      }
      
      setEmployees(employees.map(emp => 
        emp.id === employeeId ? { ...emp, status: updatedEmployee.status } : emp
      ));
    } catch (error) {
      console.error(`Failed to ${action} employee:`, error);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await authService.deleteEmployee(employeeId);
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  };
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4 text-gray-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <AiOutlineLogout className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900">
                Welcome, {user?.name}!
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Manage your employees from this dashboard.
              </p>
            </div>
          </div>
          
          {/* Employee management section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Your Employees</h2>
                <div className="flex items-center">
                  <button
                    onClick={() => fetchEmployees()}
                    className="mr-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiRefreshCw className="mr-1" /> Refresh
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <AiOutlineUserAdd className="mr-2" />
                    Add Employee
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AiOutlineSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>

              {/* Employees table */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {error}
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No employees matching your search" : "No employees found"}
                </div>
              ) : (
                <div className="mt-2 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Employee
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Joined
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                              <tr key={employee.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <AiOutlineUser className="h-6 w-6 text-gray-600" />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {employee.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{employee.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <StatusBadge status={employee.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(employee.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  {employee.status === 'PENDING' && (
                                    <>
                                      <button
                                        onClick={() => handleStatusChange(employee.id, 'approve')}
                                        className="text-green-600 hover:text-green-900 mr-3"
                                        title="Approve"
                                      >
                                        <AiOutlineCheck className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleStatusChange(employee.id, 'reject')}
                                        className="text-red-600 hover:text-red-900 mr-3"
                                        title="Reject"
                                      >
                                        <AiOutlineClose className="h-5 w-5" />
                                      </button>
                                    </>
                                  )}
                                  {employee.status === 'ACTIVE' && (
                                    <button
                                      onClick={() => handleStatusChange(employee.id, 'deactivate')}
                                      className="text-yellow-600 hover:text-yellow-900 mr-3"
                                      title="Block Employee"
                                    >
                                      <AiOutlineClose className="h-5 w-5" />
                                    </button>
                                  )}
                                  {employee.status === 'INACTIVE' && (
                                    <button
                                      onClick={() => handleStatusChange(employee.id, 'approve')}
                                      className="text-green-600 hover:text-green-900 mr-3"
                                      title="Unblock Employee"
                                    >
                                      <AiOutlineCheck className="h-5 w-5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete Employee"
                                  >
                                    <AiOutlineDelete className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <DashboardCard
              title="Employees"
              icon={<AiOutlineTeam className="h-6 w-6 text-blue-600" />}
              count={employees.length}
              description="Manage your employees"
              to="/admin/employees"
              color="bg-blue-100"
            />
            
            <DashboardCard
              title="Master Data"
              icon={<AiOutlineDatabase className="h-6 w-6 text-green-600" />}
              count="7"
              description="Manage master data forms"
              to="/masters"
              color="bg-green-100"
            />
            
            <DashboardCard
              title="Hoardings"
              icon={<AiOutlineApartment className="h-6 w-6 text-yellow-600" />}
              count=""
              description="View and manage hoardings"
              to="/masters/hoarding"
              color="bg-yellow-100"
            />
            
            <DashboardCard
              title="Clients"
              icon={<AiOutlineShop className="h-6 w-6 text-purple-600" />}
              count=""
              description="View and manage clients"
              to="/masters/client"
              color="bg-purple-100"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/masters/hoarding" className="bg-blue-600 text-white p-4 rounded-lg flex items-center justify-between hover:bg-blue-700">
              <span className="flex items-center">
                <AiOutlineApartment className="mr-2" /> Add New Hoarding
              </span>
              <span>→</span>
            </Link>
            
            <Link to="/masters/client" className="bg-green-600 text-white p-4 rounded-lg flex items-center justify-between hover:bg-green-700">
              <span className="flex items-center">
                <AiOutlineShop className="mr-2" /> Add New Client
              </span>
              <span>→</span>
            </Link>
            
            <Link to="/masters/landlord" className="bg-purple-600 text-white p-4 rounded-lg flex items-center justify-between hover:bg-purple-700">
              <span className="flex items-center">
                <AiOutlineUser className="mr-2" /> Add New Landlord
              </span>
              <span>→</span>
            </Link>
          </div>
        </main>
        
        {/* Modals */}
        <EmployeeCreateModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEmployee}
        />
        
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteEmployee}
          employee={selectedEmployee}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;