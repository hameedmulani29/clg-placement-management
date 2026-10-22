import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');

// Safely normalize: handle whether cleanBaseUrl already contains /api/v1 or not
let resolvedBaseUrl = '/api/v1';
if (cleanBaseUrl) {
  resolvedBaseUrl = cleanBaseUrl.endsWith('/api/v1')
    ? cleanBaseUrl
    : `${cleanBaseUrl}/api/v1`;
}

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
