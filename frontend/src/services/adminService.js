import { apiCall } from './apiUtils';

const baseUrl = '/admin/profile';

const getAdminProfile = () => apiCall(baseUrl);
const updateAdminProfile = (id, data) => {
  return apiCall(`${baseUrl}/${id}`, 'PUT', data); // ✅ ID in URL, data in body
};
const changeAdminPassword = (data) => apiCall(`${baseUrl}/change-password`, 'POST', data);
const createAdminProfile = (data) => apiCall(baseUrl, 'POST', data);

export const adminService = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  createAdminProfile
};
