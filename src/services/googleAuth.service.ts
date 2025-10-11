import api from './api.config';
import { AuthUtils } from '../utils/auth.utils';

export const googleAuthService = {
  loginOrRegister: async (idToken: string) => {
    // Backend now expects IdToken in the request body
    const response = await api.post('/account/google-auth', { IdToken: idToken });
    // Expect response.data.data.token
    const token = response.data?.data?.token;
    if (token) {
      AuthUtils.setToken(token);
      try { (api as any).defaults.headers.common['Authorization'] = `Bearer ${token}`; } catch (e) {}
    }
    return response.data;
  },
  isAdmin: () => {
    return AuthUtils.isAdmin();
  },
};
