import axios from 'axios';

const backendUrl = 'https://lost-and-found-xm9i.onrender.com'
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const lostService = {
  getAll: (page = 1, limit = 10) => 
    axios.get(backendUrl + '/api/items/lost', { params: { page, limit }, withCredentials: true, headers: getAuthHeaders() }),
  getById: (id) => 
    axios.get(backendUrl + `/api/items/${id}`, { withCredentials: true, headers: getAuthHeaders() }),
  create: (data) => 
    axios.post(backendUrl + '/api/items', data, { withCredentials: true, headers: getAuthHeaders() }),
  update: (id, data) => 
    axios.put(backendUrl + `/api/items/${id}`, data, { withCredentials: true, headers: getAuthHeaders() }),
  delete: (id) => 
    axios.delete(backendUrl + `/api/items/${id}`, { withCredentials: true, headers: getAuthHeaders() }),
  search: (query) => 
    axios.get(backendUrl + '/api/items', { params: { q: query, type: 'lost' }, withCredentials: true, headers: getAuthHeaders() }),
};
