import { atom } from 'jotai';

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
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  user: null,
  isAdmin: false,
});

export const loadingAtom = atom<boolean>(false);