import axios from 'axios';

const backendUrl = 'https://lost-and-found-xm9i.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  getUsers: (page = 1, limit = 10) => 
    axios.get(backendUrl + '/api/admin/users', { params: { page, limit }, withCredentials: true, headers: getAuthHeaders() }),
  blockUser: (userId) => 
    axios.put(backendUrl + `/api/admin/users/${userId}/block`, {}, { withCredentials: true, headers: getAuthHeaders() }),
  unblockUser: (userId) => 
    axios.put(backendUrl + `/api/admin/users/${userId}/unblock`, {}, { withCredentials: true, headers: getAuthHeaders() }),
  deletePost: (itemId) => 
    axios.delete(backendUrl + `/api/admin/items/${itemId}`, { withCredentials: true, headers: getAuthHeaders() }),
  approveItem: (itemId) => 
    axios.put(backendUrl + `/api/admin/items/${itemId}/approve`, {}, { withCredentials: true, headers: getAuthHeaders() }),
  rejectItem: (itemId) => 
    axios.put(backendUrl + `/api/admin/items/${itemId}/reject`, {}, { withCredentials: true, headers: getAuthHeaders() }),
  getAllItems: (page = 1, limit = 10) => 
    axios.get(backendUrl + '/api/admin/items', { params: { page, limit }, withCredentials: true, headers: getAuthHeaders() }),
  getStats: () => 
    axios.get(backendUrl + '/api/admin/stats', { withCredentials: true, headers: getAuthHeaders() }),
};
