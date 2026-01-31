import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const authService = {
  register: (data) => axios.post(backendUrl + '/api/auth/register', data, { withCredentials: true }),
  login: (data) => axios.post(backendUrl + '/api/auth/login', data, { withCredentials: true }),
  logout: () => axios.post(backendUrl + '/api/auth/logout', {}, { withCredentials: true }),
  verify: () => axios.get(backendUrl + '/api/auth/verify', { withCredentials: true }),
  me: () => axios.get(backendUrl + '/api/auth/me', { withCredentials: true }),
};
