import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    console.log('[Auth] Provider mounted, starting auth check');
    checkAuth();
    
    // Fallback: force loading to false after 5 seconds
    const fallbackTimer = setTimeout(() => {
      if (loading) {
        console.warn('Auth check taking too long, proceeding without auth');
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('[Auth] Token found, fetching profile...');
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
          console.log('[Auth] Profile loaded:', response.data.user?.email);
        } catch (error) {
          console.error('[Auth] Profile fetch failed:', error?.message || error);
          setApiError(error?.message || 'Failed to fetch profile');
          localStorage.removeItem('token');
        }
      } else {
        console.log('[Auth] No token present, user is guest');
      }
    } catch (error) {
      console.error('[Auth] Initialization failed:', error?.message || error);
    } finally {
      console.log('[Auth] Setting loading = false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('[Auth] login() called with', email);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('[Auth] login response', response.data);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (err) {
      console.error('[Auth] login error', err?.message || err);
      throw err;
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    apiError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};