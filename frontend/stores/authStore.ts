import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { type LoginResponse } from '../lib/api';

interface AuthState {
  user: LoginResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: LoginResponse | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });
          
          const response = await api.login({
            username,
            password,
            expiresInMins: 60
          });

          set({ 
            user: response, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          api.setToken(response.accessToken);
          
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
        
        api.setToken(null);
        localStorage.removeItem('token');
      },

      setUser: (user: LoginResponse | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: () => {
        const storedToken = localStorage.getItem('token');
        const state = get();
        
        if (storedToken && state.user) {
          api.setToken(storedToken);
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
