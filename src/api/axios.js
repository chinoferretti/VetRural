import axios from 'axios';
import { enqueue } from '../utils/offlineQueue';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

// Adjunta JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vetrural_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo global de respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vetrural_token');
      window.location.href = '/login';
    }

    // Si no hay conexión: encolar mutaciones para sincronizar después
    if (!navigator.onLine && ['post', 'put', 'patch', 'delete'].includes(error.config?.method)) {
      enqueue({
        method: error.config.method,
        url: error.config.url,
        data: error.config.data ? JSON.parse(error.config.data) : null,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
