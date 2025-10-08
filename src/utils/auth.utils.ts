import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

export class AuthUtils {
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<any>(token);

      // Look for role in multiple possible claim keys (Microsoft & common)
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                        decoded.role ||
                        decoded.roles ||
                        decoded['roles'] ||
                        null;

      const roles = Array.isArray(roleClaim)
        ? roleClaim
        : typeof roleClaim === 'string'
          ? [roleClaim]
          : [];

      // Case-insensitive check for admin
      return roles.some((r: any) => String(r).toLowerCase() === 'admin');
    } catch {
      return false;
    }
  }

  static getCurrentUser(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<any>(token);

      // Normalize returned object to JwtPayload-like shape
      const name = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                   decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                   decoded.name || '';
      const email = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                    decoded.email || '';
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ||
                        decoded.role ||
                        null;

      return {
        sub: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.sub || '',
        name,
        email,
        role: Array.isArray(roleClaim) ? String(roleClaim[0]) : (roleClaim || ''),
        exp: decoded.exp || 0,
      } as JwtPayload;
    } catch {
      return null;
    }
  }
}