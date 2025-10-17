import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = { id: string; nick: string } | null;

type AuthState = {
  token: string | null;
  user: User;
  setToken: (token: string | null) => void;
  setUser: (user: User) => void;
  logout: () => void;
  hydrateUser: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
      hydrateUser: async () => {
        try {
          const token = localStorage.getItem('token') || get().token;
          if (!token) return;
          const { getCurrentUser } = await import('shared/utils/userData');
          const u = await getCurrentUser();
          if (!u) return;
          set({ user: u, token });
        } catch {
          // ignore
        }
      },
    }),
    { name: 'auth-store' }
  )
);
