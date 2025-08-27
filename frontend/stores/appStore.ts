import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface NotificationState {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface AppState {
  // Theme management
  theme: Theme;
  
  // Loading states
  isGlobalLoading: boolean;
  
  // Sidebar state
  isSidebarOpen: boolean;
  
  // Notifications
  notifications: NotificationState[];
  
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setGlobalLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<NotificationState, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      isGlobalLoading: false,
      isSidebarOpen: true,
      notifications: [],

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        
        // Apply theme to document
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
      },

      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      },

      setGlobalLoading: (loading: boolean) => {
        set({ isGlobalLoading: loading });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ isSidebarOpen: open });
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2);
        const newNotification = { ...notification, id };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto remove notification after duration
        if (notification.duration !== 0) {
          const duration = notification.duration || 5000;
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen 
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          // Apply theme on hydration
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(state.theme);
        }
      },
    }
  )
);
