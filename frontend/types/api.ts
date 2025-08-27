/**
 * API Types - Centralized type definitions untuk semua API responses
 * Mengikuti structure dari DummyJSON API documentation
 */

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
  expiresInMins?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// User Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  ip: string;
  address: {
    address: string;
    city: string;
    state: string;
    stateCode: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    country: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    department: string;
    name: string;
    title: string;
    address: {
      address: string;
      city: string;
      state: string;
      stateCode: string;
      postalCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      country: string;
    };
  };
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: {
    coin: string;
    wallet: string;
    network: string;
  };
  role: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface UsersListParams {
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  key?: string;
  value?: string;
}

// Product Types
export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Array<{
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }>;
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductsListParams {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProductCreateRequest {
  title: string;
  description?: string;
  price: number;
  category?: string;
  brand?: string;
  thumbnail?: string;
  images?: string[];
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface CategoriesResponse {
  categories: string[];
}

export interface CategoryDetail {
  slug: string;
  name: string;
  url: string;
}

// Pagination Types
export interface PaginationParams {
  limit?: number;
  skip?: number;
}

export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
}

// Generic API Response Types
export interface ApiListResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}

export interface DeleteResponse {
  id: number;
  isDeleted: boolean;
  deletedOn: string;
  [key: string]: any;
}
