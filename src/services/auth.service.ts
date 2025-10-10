import api from './api.config';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../types/api.types';
import { AuthUtils } from '../utils/auth.utils';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/account/login', data);
    if (response.data.data.token) {
      AuthUtils.setToken(response.data.data.token);
      try { (api as any).defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`; } catch (e) {}
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/account/register', data);
    if (response.data.data.token) {
      AuthUtils.setToken(response.data.data.token);
      try { (api as any).defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`; } catch (e) {}
    }
    return response.data;
  },

    logout: () => {
      AuthUtils.removeToken();
    try { delete (api as any).defaults.headers.common['Authorization']; } catch (e) {}
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return AuthUtils.isAuthenticated();
  },

  isAdmin: () => {
    return AuthUtils.isAdmin();
  },

  getCurrentUser: () => {
    return AuthUtils.getCurrentUser();
  },
};