import axios from 'axios';

// In production (Render), use the backend URL from env variable.
// In development, use '/api' which is proxied by Vite to localhost:8000
const baseURL = import.meta.env.VITE_API_URL
  ? ${import.meta.env.VITE_API_URL}/api
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cybershield_token');
  if (token && config.headers) {
    config.headers.Authorization = Bearer ;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cybershield_token');
      localStorage.removeItem('cybershield_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
