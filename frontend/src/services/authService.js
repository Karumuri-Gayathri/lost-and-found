import axios from 'axios';

const backendUrl = 'https://lost-and-found-xm9i.onrender.com'
export const authService = {
  register: (data) => axios.post(backendUrl + '/api/auth/register', data, { withCredentials: true }),
  login: (data) => axios.post(backendUrl + '/api/auth/login', data, { withCredentials: true }),
  logout: () => axios.post(backendUrl + '/api/auth/logout', {}, { withCredentials: true }),
  verify: () => axios.get(backendUrl + '/api/auth/verify', { withCredentials: true }),
  me: () => axios.get(backendUrl + '/api/auth/me', { withCredentials: true }),
};
