import { getToken } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || 'Something went wrong');
  }
  
  return responseData;
};

// Auth services
export const login = (credentials) => {
  return apiCall('/auth/login', 'POST', credentials);
};

export const register = (userData) => {
  return apiCall('/auth/register', 'POST', userData);
};

// Admin services
export const createAdmin = (adminData) => {
  return apiCall('/auth/admin/create', 'POST', adminData);
};

export const getAdmins = () => {
  return apiCall('/users?role=ADMIN');
};

export const getEmployees = () => {
  return apiCall('/admin/employees');
};

export const createEmployee = (employeeData) => {
  return apiCall('/admin/employees/create', 'POST', employeeData);
};

export const approveEmployee = (employeeId) => {
  return apiCall(`/admin/employees/${employeeId}/approve`, 'PUT');
};

export const rejectEmployee = (employeeId) => {
  return apiCall(`/admin/employees/${employeeId}/reject`, 'PUT');
};

export const deactivateEmployee = (employeeId) => {
  return apiCall(`/admin/employees/${employeeId}/deactivate`, 'PUT');
};

export const deleteEmployee = (employeeId) => {
  return apiCall(`/admin/employees/${employeeId}`, 'DELETE');
};

// Super Admin services
export const getAllAdmins = () => {
  return apiCall('/super-admin/admins');
};

export const createAdminBySuperAdmin = (adminData) => {
  return apiCall('/super-admin/admins/create', 'POST', adminData);
};

export const updateAdmin = (adminId, adminData) => {
  return apiCall(`/super-admin/admins/${adminId}`, 'PATCH', adminData);
};

export const deleteAdmin = (adminId) => {
  return apiCall(`/super-admin/admins/${adminId}`, 'DELETE');
};

export const blockAdmin = (adminId) => {
  return apiCall(`/super-admin/admins/${adminId}/block`, 'PATCH');
};

export const unblockAdmin = (adminId) => {
  return apiCall(`/super-admin/admins/${adminId}/unblock`, 'PATCH');
};

export default {
  login,
  register,
  createAdmin,
  getAdmins,
  getEmployees,
  approveEmployee,
  deactivateEmployee,
  getAllAdmins,
  createAdminBySuperAdmin,
  updateAdmin,
  deleteAdmin,
  blockAdmin,
  unblockAdmin
};