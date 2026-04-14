import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('propvista_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('propvista_token');
      localStorage.removeItem('propvista_token');
      localStorage.removeItem('propvista_user');
      // Only redirect if the user had a session (expired token), not on public pages
      if (hadToken) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
