import axios from 'axios';

// You should configure this to point to your backend's base URL.
// In a Vite-based project, environment variables are accessed via `import.meta.env`.
// For security, only variables prefixed with `VITE_` are exposed to the client.
// See: https://vitejs.dev/guide/env-and-mode.html
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // Content-Type will be automatically set by Axios based on the data being sent
  },
  // withCredentials: true, // Use this if you need to send cookies with requests (e.g., for sessions)
});

// You can also add interceptors here for handling tokens or global errors.

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