import { create } from 'zustand';
import { usersService } from '../services/users';
import type { User, UsersResponse } from '../types/api';

interface UserFilters {
  search: string;
  sortBy: string;
  order: 'asc' | 'desc';
  gender: string;
  role: string;
  eyeColor: string;
  ageMin: number | null;
  ageMax: number | null;
}

interface UserState {
  // Users data
  users: User[];
  currentUser: User | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: UserFilters;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Selection state (for potential bulk operations)
  selectedUsers: number[];
  
  // Actions - Data fetching
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  
  // Actions - CRUD operations (if needed)
  createUser: (data: Partial<User>) => Promise<void>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  deleteMultipleUsers: (ids: number[]) => Promise<void>;
  
  // Actions - Filters and pagination
  setFilters: (filters: Partial<UserFilters>) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  
  // Actions - Selection
  selectUser: (id: number) => void;
  deselectUser: (id: number) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  
  // Actions - State management
  setCurrentUser: (user: User | null) => void;
  clearCurrentUser: () => void;
}

const defaultFilters: UserFilters = {
  search: '',
  sortBy: '',
  order: 'asc',
  gender: '',
  role: '',
  eyeColor: '',
  ageMin: null,
  ageMax: null,
};

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  users: [],
  currentUser: null,
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  filters: defaultFilters,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  selectedUsers: [],

  // Data fetching actions
  fetchUsers: async () => {
    const state = get();
    set({ isLoading: true });
    
    try {
      const params: any = {
        limit: state.itemsPerPage,
        skip: (state.currentPage - 1) * state.itemsPerPage,
        sortBy: state.filters.sortBy || undefined,
        order: state.filters.order,
      };

      // Handle search vs filter
      if (state.filters.search) {
        params.search = state.filters.search;
      } else {
        // Apply filters
        if (state.filters.gender) params.gender = state.filters.gender;
        if (state.filters.role) params.role = state.filters.role;
        if (state.filters.eyeColor) params.eyeColor = state.filters.eyeColor;
        if (state.filters.ageMin !== null) params.ageMin = state.filters.ageMin;
        if (state.filters.ageMax !== null) params.ageMax = state.filters.ageMax;
      }
      
      const response = await usersService.getUsers(params);
      
      set({
        users: response.users,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / state.itemsPerPage),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUserById: async (id: number) => {
    set({ isLoading: true });
    
    try {
      const user = await usersService.getUserById(id);
      set({ currentUser: user, isLoading: false });
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      set({ isLoading: false });
      throw error;
    }
  },

  searchUsers: async (query: string) => {
    set({ isLoading: true });
    
    try {
      const state = get();
      const response = await usersService.searchUsers(query, {
        limit: state.itemsPerPage,
        skip: (state.currentPage - 1) * state.itemsPerPage,
      });
      
      set({
        users: response.users,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / state.itemsPerPage),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to search users:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  // CRUD operations (for completeness, even though requirements say no add/edit for users)
  createUser: async (data: Partial<User>) => {
    set({ isCreating: true });
    
    try {
      // Note: This would typically call a service method
      // For DummyJSON API, this is simulated
      console.log('Creating user (simulated):', data);
      set({ isCreating: false });
      
      // Refresh users list
      get().fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      set({ isCreating: false });
      throw error;
    }
  },

  updateUser: async (id: number, data: Partial<User>) => {
    set({ isUpdating: true });
    
    try {
      // Note: This would typically call a service method
      console.log('Updating user (simulated):', id, data);
      
      set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
        currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser,
        isUpdating: false,
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
      set({ isUpdating: false });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set({ isDeleting: true });
    
    try {
      // Note: This would typically call a service method
      console.log('Deleting user (simulated):', id);
      
      set((state) => ({
        users: state.users.filter(u => u.id !== id),
        selectedUsers: state.selectedUsers.filter(uid => uid !== id),
        isDeleting: false,
      }));
    } catch (error) {
      console.error('Failed to delete user:', error);
      set({ isDeleting: false });
      throw error;
    }
  },

  deleteMultipleUsers: async (ids: number[]) => {
    set({ isDeleting: true });
    
    try {
      console.log('Deleting multiple users (simulated):', ids);
      
      set((state) => ({
        users: state.users.filter(u => !ids.includes(u.id)),
        selectedUsers: [],
        isDeleting: false,
      }));
    } catch (error) {
      console.error('Failed to delete multiple users:', error);
      set({ isDeleting: false });
      throw error;
    }
  },

  // Filters and pagination
  setFilters: (newFilters: Partial<UserFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
      selectedUsers: [], // Clear selection when filters change
    }));
    
    // Auto fetch with new filters
    setTimeout(() => get().fetchUsers(), 0);
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page, selectedUsers: [] });
    
    // Auto fetch with new page
    setTimeout(() => get().fetchUsers(), 0);
  },

  resetFilters: () => {
    set({ 
      filters: defaultFilters, 
      currentPage: 1,
      selectedUsers: [],
    });
    
    // Auto fetch with reset filters
    setTimeout(() => get().fetchUsers(), 0);
  },

  // Selection management
  selectUser: (id: number) => {
    set((state) => ({
      selectedUsers: [...state.selectedUsers, id]
    }));
  },

  deselectUser: (id: number) => {
    set((state) => ({
      selectedUsers: state.selectedUsers.filter(uid => uid !== id)
    }));
  },

  selectAllUsers: () => {
    const state = get();
    set({ selectedUsers: state.users.map(u => u.id) });
  },

  clearSelection: () => {
    set({ selectedUsers: [] });
  },

  // State management
  setCurrentUser: (user: User | null) => {
    set({ currentUser: user });
  },

  clearCurrentUser: () => {
    set({ currentUser: null });
  },
}));
