import { getAuthHeader } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to handle fetch requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.data = data;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

// Auth services
export const authService = {
  register: (userData) => 
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
  login: (credentials) => 
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
};

// User services
export const userService = {
  getUsers: () => 
    fetchWithAuth('/users'),
    
  getUserById: (id) => 
    fetchWithAuth(`/users/${id}`),
    
  updateUser: (id, userData) => 
    fetchWithAuth(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
    
  deleteUser: (id) => 
    fetchWithAuth(`/users/${id}`, {
      method: 'DELETE'
    })
};

// Enquiry services
export const enquiryService = {
  create: (data) =>
    fetchWithAuth('/admin/enquiry', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    fetchWithAuth(`/admin/enquiry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    fetchWithAuth(`/admin/enquiry/${id}`, {
      method: 'DELETE'
    }),
  getAll: () =>
    fetchWithAuth('/admin/enquiry'),
  getById: (id) =>
    fetchWithAuth(`/admin/enquiry/${id}`)
};

// Quotation services
export const quotationService = {
  create: (data) =>
    fetchWithAuth('/admin/quotation', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) =>
    fetchWithAuth(`/admin/quotation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    fetchWithAuth(`/admin/quotation/${id}`, {
      method: 'DELETE'
    }),
  getAll: () =>
    fetchWithAuth('/admin/quotation'),
  getById: (id) =>
    fetchWithAuth(`/admin/quotation/${id}`),
  searchEnquiry: (params) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/quotation/search?${query}`);
  },
  exportPDF: (id) =>
    fetchWithAuth(`/admin/quotation/${id}/pdf`),
  exportExcel: (id) =>
    fetchWithAuth(`/admin/quotation/${id}/excel`),
  getHoardings: (filters) => {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return fetchWithAuth(`/admin/hoardings${query}`);
  },
  createEnquiry: (data) =>
    fetchWithAuth('/admin/enquiry', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// Vendor API (Admin)
export const getVendors = () => fetchWithAuth('/admin/vendors');
export const getVendorById = (id) => fetchWithAuth(`/admin/vendors/${id}`);
export const createVendor = (data) => fetchWithAuth('/admin/vendors', {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
});
export const updateVendor = (id, data) => fetchWithAuth(`/admin/vendors/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'application/json', ...getAuthHeader() }
});
export const deleteVendor = (id) => fetchWithAuth(`/admin/vendors/${id}`, {
  method: 'DELETE'
});

export const getEnquiryByNumber = (enquiryNumber) =>
  fetchWithAuth(`/admin/enquiry/by-enquiry-number?enquiryNumber=${enquiryNumber}`);

export const createQuotation = (data) =>
  fetchWithAuth('/admin/quotation/create', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const createCampaign = (data) =>
  fetchWithAuth('/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export { fetchWithAuth };