import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  email: string;
  token: string;
}

export interface DecodedToken {
  [key: string]: any;
  exp?: number;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('token');
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/account/login`, credentials);
  // successful login response
      
      const { token } = response.data;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Decode token (only decode errors should map to "Invalid token format")
      let decoded: any;
      try {
        decoded = jwtDecode<any>(token);
      } catch (decodeError) {
        console.error('Token decode error:', decodeError);
        throw new Error('Invalid token format');
      }

      // Check if the token contains role information from several possible claim keys
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                        decoded.role ||
                        decoded.roles ||
                        decoded['roles'] ||
                        [];

      const roles = Array.isArray(roleClaim) ? roleClaim
        : typeof roleClaim === 'string' ? [roleClaim]
        : [];

  // roles parsed from token

      // Case-insensitive check for admin role
      const hasAdmin = roles.some((r) => String(r).toLowerCase() === 'admin');
      if (!hasAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set default Authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      this.token = token;
      
      // Extract name and email from response or token claims
      const name = response.data.name || '';
      const email = response.data.email || credentials.email;
      
      return { token, name, email };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    this.token = null;
  }

  isAuthenticated(): boolean {
    if (!this.token) return false;
    
    try {
      const decoded = jwtDecode<any>(this.token);
      
      // Check for token expiration
      if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
        this.logout(); // Clear expired token
        return false;
      }
      
      // Look for roles in multiple possible locations
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                        decoded.role ||
                        decoded.roles ||
                        decoded['roles'] ||
                        [];

      const roles = Array.isArray(roleClaim) ? roleClaim
        : typeof roleClaim === 'string' ? [roleClaim]
        : [];

      // Case-insensitive admin check
      return roles.some((r: any) => String(r).toLowerCase() === 'admin');
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getDecodedToken(): DecodedToken | null {
    if (!this.token) return null;
    
    try {
      return jwtDecode<DecodedToken>(this.token);
    } catch {
      return null;
    }
  }

  getUserInfo(): { name: string; email: string } | null {
    if (!this.token) return null;
    
    try {
      const decoded = jwtDecode<any>(this.token);
      return {
        name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
              decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
              decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
              decoded.name || '',
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
               decoded.email || ''
      };
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
