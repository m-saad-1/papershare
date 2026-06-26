import axios from 'axios';

const normalizeApiBase = (rawBase) => {
  if (!rawBase || typeof rawBase !== 'string') return '/api';
  const trimmed = rawBase.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Content-Type will be automatically set by Axios based on the data being sent
  },
  // withCredentials: true, // Use this if you need to send cookies with requests (e.g., for sessions)
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;