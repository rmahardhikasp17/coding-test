/**
 * Axios-based API service for DummyJSON integration
 * Full axios compliance dengan interceptors dan error handling
 */

import axios, { AxiosResponse, AxiosError } from '../lib/axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  User, 
  UsersResponse, 
  UsersListParams,
  Product, 
  ProductsResponse, 
  ProductsListParams,
  ProductCreateRequest,
  ProductUpdateRequest,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '../types/api';

// Create axios instance dengan base configuration
const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor untuk logging dan auth headers
api.interceptors.request.use(
  (config) => {
    console.log(`🔗 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor untuk logging dan error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ Response: ${response.status} ${response.statusText}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ API Error: ${error.message}`);
    
    if (error.response) {
      // Server responded dengan error status
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
      
      // Handle 401 Unauthorized - auto logout
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      console.error('No response received:', error.request);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser(): Promise<LoginResponse> {
    const response = await api.get<LoginResponse>('/auth/me');
    return response.data;
  },

  async refreshToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', refreshData);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  async getUsers(params: UsersListParams = {}): Promise<UsersResponse> {
    const queryParams: Record<string, any> = {};

    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.skip !== undefined) queryParams.skip = params.skip;
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.order = params.order || 'asc';
    }

    // Handle search
    if (params.search?.trim()) {
      const response = await api.get<UsersResponse>('/users/search', {
        params: {
          q: params.search.trim(),
          limit: params.limit,
          skip: params.skip,
        },
      });
      return response.data;
    }

    // Handle filtering
    if (params.key && params.value) {
      const response = await api.get<UsersResponse>('/users/filter', {
        params: {
          key: params.key,
          value: params.value,
          limit: params.limit,
          skip: params.skip,
        },
      });
      return response.data;
    }

    const response = await api.get<UsersResponse>('/users', { params: queryParams });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async searchUsers(query: string, limit?: number, skip?: number): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users/search', {
      params: { q: query, limit, skip },
    });
    return response.data;
  },

  async filterUsers(key: string, value: string, limit?: number, skip?: number): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>('/users/filter', {
      params: { key, value, limit, skip },
    });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  async getProducts(params: ProductsListParams = {}): Promise<ProductsResponse> {
    const queryParams: Record<string, any> = {};

    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.skip !== undefined) queryParams.skip = params.skip;
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.order = params.order || 'asc';
    }

    // Handle search
    if (params.search?.trim()) {
      const response = await api.get<ProductsResponse>('/products/search', {
        params: {
          q: params.search.trim(),
          limit: params.limit,
          skip: params.skip,
        },
      });
      return response.data;
    }

    // Handle category filtering
    if (params.category?.trim()) {
      const response = await api.get<ProductsResponse>(`/products/category/${encodeURIComponent(params.category)}`, {
        params: {
          limit: params.limit,
          skip: params.skip,
        },
      });
      return response.data;
    }

    const response = await api.get<ProductsResponse>('/products', { params: queryParams });
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    const response = await api.post<Product>('/products/add', productData);
    return response.data;
  },

  async updateProduct(id: number, productData: Partial<ProductCreateRequest>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ id: number; isDeleted: boolean; deletedOn: string }> {
    const response = await api.delete<{ id: number; isDeleted: boolean; deletedOn: string }>(`/products/${id}`);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<string[]>('/products/category-list');
    return response.data;
  },

  async getCategoriesWithDetails(): Promise<Array<{slug: string, name: string, url: string}>> {
    const response = await api.get<Array<{slug: string, name: string, url: string}>>('/products/categories');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  isAxiosError: axios.isAxiosError,
  
  getErrorMessage: (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.response) {
        return `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      if (error.request) {
        return 'No response from server. Please check your internet connection.';
      }
    }
    return error instanceof Error ? error.message : 'An unexpected error occurred';
  },

  formatPrice: (price: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  },

  calculateDiscountedPrice: (price: number, discountPercentage: number): number => {
    return price - (price * discountPercentage / 100);
  },
};

export default api;
