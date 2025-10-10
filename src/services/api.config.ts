import axios from 'axios';

// Prefer Vite environment variable, fallback to the known remote API URL.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://kamalalgointern-001-site1.qtempurl.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  // Do not set a global Content-Type here. Let axios/browser set it per-request.
});

// Request interceptor for adding auth token
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

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Remove only the token on 401, do not redirect to login here.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // No redirect to /login here
    }
    return Promise.reject(error);
  }
);

export default api;