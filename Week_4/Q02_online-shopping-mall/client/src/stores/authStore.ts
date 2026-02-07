import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('auth-token', token);
        set({ user, token });
      },
      clearAuth: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, token: null });
      },
    }),
    { name: 'auth-storage' },
  ),
);
