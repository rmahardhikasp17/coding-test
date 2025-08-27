import { create } from 'zustand';
import { productsService } from '../services/products';
import type { Product, ProductsResponse, ProductCreateRequest, ProductUpdateRequest } from '../types/api';

interface ProductFilters {
  search: string;
  category: string;
  sortBy: string;
  order: 'asc' | 'desc';
}

interface ProductState {
  // Products data
  products: Product[];
  currentProduct: Product | null;
  categories: string[];
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  
  // Filters
  filters: ProductFilters;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Selection state
  selectedProducts: number[];
  
  // Actions - Data fetching
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  
  // Actions - CRUD operations
  createProduct: (data: ProductCreateRequest) => Promise<void>;
  updateProduct: (data: ProductUpdateRequest) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  deleteMultipleProducts: (ids: number[]) => Promise<void>;
  
  // Actions - Filters and pagination
  setFilters: (filters: Partial<ProductFilters>) => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
  
  // Actions - Selection
  selectProduct: (id: number) => void;
  deselectProduct: (id: number) => void;
  selectAllProducts: () => void;
  clearSelection: () => void;
  
  // Actions - State management
  setCurrentProduct: (product: Product | null) => void;
  clearCurrentProduct: () => void;
}

const defaultFilters: ProductFilters = {
  search: '',
  category: '',
  sortBy: '',
  order: 'asc',
};

export const useProductStore = create<ProductState>((set, get) => ({
  // Initial state
  products: [],
  currentProduct: null,
  categories: [],
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 10,
  filters: defaultFilters,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  selectedProducts: [],

  // Data fetching actions
  fetchProducts: async () => {
    const state = get();
    set({ isLoading: true });
    
    try {
      const response = await productsService.getProducts({
        limit: state.itemsPerPage,
        skip: (state.currentPage - 1) * state.itemsPerPage,
        search: state.filters.search || undefined,
        category: state.filters.category || undefined,
        sortBy: state.filters.sortBy || undefined,
        order: state.filters.order,
      });
      
      set({
        products: response.products,
        totalItems: response.total,
        totalPages: Math.ceil(response.total / state.itemsPerPage),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProductById: async (id: number) => {
    set({ isLoading: true });
    
    try {
      const product = await productsService.getProductById(id);
      set({ currentProduct: product, isLoading: false });
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productsService.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  },

  // CRUD operations
  createProduct: async (data: ProductCreateRequest) => {
    set({ isCreating: true });
    
    try {
      const product = await productsService.createProduct(data);
      set({ isCreating: false });
      
      // Refresh products list
      get().fetchProducts();
    } catch (error) {
      console.error('Failed to create product:', error);
      set({ isCreating: false });
      throw error;
    }
  },

  updateProduct: async (data: ProductUpdateRequest) => {
    set({ isUpdating: true });
    
    try {
      const updatedProduct = await productsService.updateProduct(data);
      
      set((state) => ({
        products: state.products.map(p => p.id === data.id ? updatedProduct : p),
        currentProduct: state.currentProduct?.id === data.id ? updatedProduct : state.currentProduct,
        isUpdating: false,
      }));
    } catch (error) {
      console.error('Failed to update product:', error);
      set({ isUpdating: false });
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    set({ isDeleting: true });
    
    try {
      await productsService.deleteProduct(id);
      
      set((state) => ({
        products: state.products.filter(p => p.id !== id),
        selectedProducts: state.selectedProducts.filter(pid => pid !== id),
        isDeleting: false,
      }));
    } catch (error) {
      console.error('Failed to delete product:', error);
      set({ isDeleting: false });
      throw error;
    }
  },

  deleteMultipleProducts: async (ids: number[]) => {
    set({ isDeleting: true });
    
    try {
      await Promise.all(ids.map(id => productsService.deleteProduct(id)));
      
      set((state) => ({
        products: state.products.filter(p => !ids.includes(p.id)),
        selectedProducts: [],
        isDeleting: false,
      }));
    } catch (error) {
      console.error('Failed to delete multiple products:', error);
      set({ isDeleting: false });
      throw error;
    }
  },

  // Filters and pagination
  setFilters: (newFilters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
      selectedProducts: [], // Clear selection when filters change
    }));
    
    // Auto fetch with new filters
    setTimeout(() => get().fetchProducts(), 0);
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page, selectedProducts: [] });
    
    // Auto fetch with new page
    setTimeout(() => get().fetchProducts(), 0);
  },

  resetFilters: () => {
    set({ 
      filters: defaultFilters, 
      currentPage: 1,
      selectedProducts: [],
    });
    
    // Auto fetch with reset filters
    setTimeout(() => get().fetchProducts(), 0);
  },

  // Selection management
  selectProduct: (id: number) => {
    set((state) => ({
      selectedProducts: [...state.selectedProducts, id]
    }));
  },

  deselectProduct: (id: number) => {
    set((state) => ({
      selectedProducts: state.selectedProducts.filter(pid => pid !== id)
    }));
  },

  selectAllProducts: () => {
    const state = get();
    set({ selectedProducts: state.products.map(p => p.id) });
  },

  clearSelection: () => {
    set({ selectedProducts: [] });
  },

  // State management
  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product });
  },

  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },
}));
