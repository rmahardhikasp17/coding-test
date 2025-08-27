const BASE_URL = 'https://dummyjson.com';

// Auth types
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

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

// User types
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

// Product types
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
  brand: string;
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
  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
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

export interface Category {
  slug: string;
  name: string;
  url: string;
}

// Request parameters interfaces
export interface UsersListParams {
  limit?: number;
  skip?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  // Filter params
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  role?: string;
  eyeColor?: string;
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
  category?: string;
  price?: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail?: string;
  images?: string[];
}

export interface ProductUpdateRequest extends ProductCreateRequest {
  id: number;
}

// API class
class DummyJSONAPI {
  private baseURL = BASE_URL;
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the API. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.accessToken);
    return response;
  }

  async getMe(): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/me', {
      method: 'GET',
    });
  }

  async refreshToken(refreshToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
  }

  // Users methods
  async getUsers(params: UsersListParams = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.skip) searchParams.set('skip', params.skip.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.order) searchParams.set('order', params.order);

    let endpoint: string;
    
    if (params.search) {
      searchParams.set('q', params.search);
      endpoint = `/users/search?${searchParams.toString()}`;
    } else {
      endpoint = `/users?${searchParams.toString()}`;
    }

    const response = await this.request<UsersResponse>(endpoint);

    // Apply client-side filtering for advanced filters
    if (params.gender || params.ageMin || params.ageMax || params.role || params.eyeColor) {
      response.users = response.users.filter(user => {
        if (params.gender && user.gender !== params.gender) return false;
        if (params.ageMin && user.age < params.ageMin) return false;
        if (params.ageMax && user.age > params.ageMax) return false;
        if (params.role && user.role !== params.role) return false;
        if (params.eyeColor && user.eyeColor !== params.eyeColor) return false;
        return true;
      });
      response.total = response.users.length;
    }

    return response;
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/add', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number): Promise<User & { isDeleted: boolean; deletedOn: string }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Products methods
  async getProducts(params: ProductsListParams = {}): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.skip) searchParams.set('skip', params.skip.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.order) searchParams.set('order', params.order);

    let endpoint: string;
    
    if (params.search) {
      searchParams.set('q', params.search);
      endpoint = `/products/search?${searchParams.toString()}`;
    } else if (params.category) {
      endpoint = `/products/category/${params.category}?${searchParams.toString()}`;
    } else {
      endpoint = `/products?${searchParams.toString()}`;
    }

    return this.request<ProductsResponse>(endpoint);
  }

  async getProduct(id: number): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    return this.request<Product>('/products/add', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: number, productData: Partial<ProductCreateRequest>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: number): Promise<Product & { isDeleted: boolean; deletedOn: string }> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/products/categories');
  }

  async getCategoryList(): Promise<string[]> {
    return this.request<string[]>('/products/category-list');
  }
}

// Export singleton instance
export const api = new DummyJSONAPI();
export default api;
