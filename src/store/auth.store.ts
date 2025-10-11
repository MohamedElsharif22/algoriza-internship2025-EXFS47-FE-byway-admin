import { atom } from 'jotai';
import { AuthUtils } from '../utils/auth.utils';

interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  isAdmin: boolean;
}

export const authAtom = atom<AuthState>({
  isAuthenticated: !!AuthUtils.getToken(),
  token: AuthUtils.getToken(),
  user: null,
  isAdmin: false,
});

export const loadingAtom = atom<boolean>(false);