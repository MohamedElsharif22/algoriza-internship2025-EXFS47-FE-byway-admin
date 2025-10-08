import { atom } from 'jotai';
import { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export const authAtom = atom<AuthState>({
  isAuthenticated: false,
  user: null,
  loading: true,
});

// Derived atoms
export const isAuthenticatedAtom = atom(
  (get) => get(authAtom).isAuthenticated
);

export const userAtom = atom(
  (get) => get(authAtom).user
);

export const isLoadingAtom = atom(
  (get) => get(authAtom).loading
);