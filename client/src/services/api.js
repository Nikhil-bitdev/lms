import axios from 'axios';

// Dynamic port detection: try sequential ports until one responds to /ping
const candidatePorts = [
  ...(import.meta.env.VITE_API_URL ? [] : [5000, 5001, 5002])
];
let dynamicResolved = false;
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let resolvingPromise = null;

async function probePort(port) {
  try {
    const res = await fetch(`http://localhost:${port}/api/ping`, { method: 'GET', cache: 'no-store' });
    if (res.ok) return true;
  } catch (_) {}
  return false;
}

async function resolveDynamicBase() {
  if (dynamicResolved || import.meta.env.VITE_API_URL) return baseURL;
  for (const p of candidatePorts) {
    // Skip if base already set to this attempt and working
    if (await probePort(p)) {
      baseURL = `http://localhost:${p}/api`;
      dynamicResolved = true;
      console.log('[api] dynamic backend resolved ->', baseURL);
      api.defaults.baseURL = baseURL;
      return baseURL;
    }
  }
  console.warn('[api] No backend detected on candidate ports, keeping default', baseURL);
  return baseURL;
}

// Kick off resolution early (non-blocking)
if (!import.meta.env.VITE_API_URL) {
  resolvingPromise = resolveDynamicBase();
}

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
    // If network error and dynamic not resolved yet, attempt resolution then retry
    if (!error.response && !dynamicResolved && resolvingPromise) {
      await resolvingPromise;
      error.config.baseURL = baseURL; // adjust request
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

export const getApiBaseURL = () => baseURL;
export const waitForApiBaseURL = () => resolvingPromise || Promise.resolve(baseURL);

export default api;