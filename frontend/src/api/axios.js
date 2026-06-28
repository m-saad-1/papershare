import axios from 'axios';

const normalizeApiBase = (rawBase) => {
  if (!rawBase || typeof rawBase !== 'string') return '/api';
  const trimmed = rawBase.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBase(import.meta.env.VITE_API_BASE_URL),
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  },
  withCredentials: true,
});

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

export default api;
