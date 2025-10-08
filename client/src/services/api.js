import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const fallbackBaseURLs = ['http://localhost:5001/api', 'http://localhost:5002/api'];
let retryIndex = 0;
let networkRetrying = false;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    if (!error.response && retryIndex < fallbackBaseURLs.length && !networkRetrying) {
      networkRetrying = true;
      const next = fallbackBaseURLs[retryIndex++];
      console.warn(`[api] Primary baseURL failed (${baseURL}). Trying fallback: ${next}`);
      api.defaults.baseURL = baseURL = next;
      networkRetrying = false;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export const getApiBaseURL = () => baseURL;

export default api;