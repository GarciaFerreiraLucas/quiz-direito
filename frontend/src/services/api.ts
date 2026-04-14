import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect to login on 401 (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login/register/public pages
      const publicPaths = ['/', '/cadastro', '/esqueci-senha', '/reset-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('quiz_user');
        sessionStorage.removeItem('quiz_is_guest');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
