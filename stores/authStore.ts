import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    name?: string;
    image?: string;
    username?: string;
  } | null;
  isLoading: boolean;
  setUser: (user: AuthState['user']) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ isAuthenticated: false, user: null }),
})); 