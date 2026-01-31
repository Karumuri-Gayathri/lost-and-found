import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const didAuthRef = useRef(false);
  useEffect(() => {
    if (didAuthRef.current) return;
    didAuthRef.current = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('AuthContext: checkAuth token=', token);
        if (token) {
          const response = await axios.get(backendUrl + '/api/auth/me', {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = response.data.data || response.data.user;
          console.log('AuthContext: checkAuth got user=', userData?.email);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(backendUrl + '/api/auth/login', 
        { email, password },
        { withCredentials: true }
      );
      // Support multiple response shapes: response.data.token or response.data.data.token
      const rootToken = response.data?.token;
      const userData = response.data?.data || response.data?.user || response.data;
      const token = rootToken || userData?.token;
      console.log('AuthContext: login response user=', userData?.email, 'token=', !!token);
      if (token) {
        localStorage.setItem('token', token);
      }
      setUser(userData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (name, email, password, role = 'user') => {
    try {
      setError(null);
      const response = await axios.post(backendUrl + '/api/auth/register', 
        { name, email, password, role },
        { withCredentials: true }
      );
      const rootToken = response.data?.token;
      const userData = response.data?.data || response.data?.user || response.data;
      const token = rootToken || userData?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      setUser(userData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      console.error('Registration error:', err.response?.data || err);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(backendUrl + '/api/auth/logout', {}, {
        withCredentials: true,
      });
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
