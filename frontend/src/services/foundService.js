import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const foundService = {
  getAll: (page = 1, limit = 10) => 
    axios.get(backendUrl + '/api/items/found', { params: { page, limit }, withCredentials: true, headers: getAuthHeaders() }),
  getById: (id) => 
    axios.get(backendUrl + `/api/items/${id}`, { withCredentials: true, headers: getAuthHeaders() }),
  create: (data) => 
    axios.post(backendUrl + '/api/items', data, { withCredentials: true, headers: getAuthHeaders() }),
  update: (id, data) => 
    axios.put(backendUrl + `/api/items/${id}`, data, { withCredentials: true, headers: getAuthHeaders() }),
  delete: (id) => 
    axios.delete(backendUrl + `/api/items/${id}`, { withCredentials: true, headers: getAuthHeaders() }),
  search: (query) => 
    axios.get(backendUrl + '/api/items', { params: { q: query, type: 'found' }, withCredentials: true, headers: getAuthHeaders() }),
};
