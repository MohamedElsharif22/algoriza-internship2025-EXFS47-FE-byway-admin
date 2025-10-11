import axios from 'axios';
import { AuthUtils } from '../utils/auth.utils';

// Prefer Vite environment variable, fallback to the known remote API URL.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://kamalalgointern-001-site1.qtempurl.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  // Do not set a global Content-Type here — let axios/browser set it per-request
});

// Request interceptor for API calls: attach the shared 'token' value
api.interceptors.request.use(
  (config) => {
    const token = AuthUtils.getToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug('api (secondary): attaching Authorization header, token present');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // prefer AuthUtils for refresh token if available
        // (keep backwards compatible fallback to localStorage)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { AuthUtils } = require('../utils/auth.utils');
        const rt = AuthUtils?.getRefreshToken ? AuthUtils.getRefreshToken() : refreshToken;
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: rt,
        });

        const { accessToken } = response.data;
        if (accessToken) {
          // keep the older token key handling for compatibility if server returns accessToken
          localStorage.setItem('token', accessToken);
          // retry the original request with the refreshed token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        // If refresh token fails, do not redirect or clear tokens here.
        // Let the application decide (logout button or other flow) when to remove tokens.
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;