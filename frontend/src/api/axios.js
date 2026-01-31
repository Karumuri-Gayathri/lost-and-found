import axios from 'axios';

const API_BASE_URL = "https://lost-and-found-xm9i.onrender.com";

// Helper function to handle API calls
const handleRequest = async (method, url, data = null, options = {}) => {
  try {
    // Attach Authorization header from localStorage token when available
    let token = null;
    try {
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      token = null;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      withCredentials: true,
      headers,
      ...options,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      // Prevent redirect loops: only navigate to /login if not already there
      try {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } catch (e) {
        // ignore when window is not available (SSR/test)
      }
    }
    
    throw {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    };
  }
};

// Export API methods
export const api = {
  get: (url, options = {}) => handleRequest('GET', url, null, options),
  post: (url, data, options = {}) => handleRequest('POST', url, data, options),
  put: (url, data, options = {}) => handleRequest('PUT', url, data, options),
  patch: (url, data, options = {}) => handleRequest('PATCH', url, data, options),
  delete: (url, options = {}) => handleRequest('DELETE', url, null, options),
};

export default api;
