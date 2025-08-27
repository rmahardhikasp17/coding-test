/**
 * Products Service - Single responsibility untuk product data operations
 * Menggunakan DummyJSON API langsung dengan full CRUD operations
 */

import { productsAPI, apiUtils } from './api';
import type {
  Product,
  ProductsResponse,
  ProductsListParams,
  ProductCreateRequest,
  ProductUpdateRequest,
  CategoriesResponse,
  DeleteResponse,
  PaginationParams
} from '../types/api';

export class ProductsService {
  private readonly BASE_ENDPOINT = '/products';

  /**
   * Get all products dengan pagination, search, filtering, dan sorting
   */
  async getProducts(params: ProductsListParams = {}): Promise<ProductsResponse> {
    try {
      return await productsAPI.getProducts(params);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    try {
      return await productsAPI.getProductById(id);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(
    query: string, 
    pagination: PaginationParams = {}
  ): Promise<ProductsResponse> {
    const queryParams: Record<string, string> = {
      q: query.trim(),
    };

    if (pagination.limit !== undefined) {
      queryParams.limit = pagination.limit.toString();
    }
    if (pagination.skip !== undefined) {
      queryParams.skip = pagination.skip.toString();
    }

    try {
      return await httpClient.get<ProductsResponse>(`${this.BASE_ENDPOINT}/search`, queryParams);
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string, 
    pagination: PaginationParams = {}
  ): Promise<ProductsResponse> {
    const queryParams: Record<string, string> = {};

    if (pagination.limit !== undefined) {
      queryParams.limit = pagination.limit.toString();
    }
    if (pagination.skip !== undefined) {
      queryParams.skip = pagination.skip.toString();
    }

    try {
      return await httpClient.get<ProductsResponse>(
        `${this.BASE_ENDPOINT}/category/${encodeURIComponent(category)}`, 
        queryParams
      );
    } catch (error) {
      console.error(`Failed to fetch products for category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData: ProductCreateRequest): Promise<Product> {
    try {
      return await productsAPI.createProduct(productData);
    } catch (error) {
      console.error('Failed to create product:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update existing product
   */
  async updateProduct(productData: ProductUpdateRequest): Promise<Product> {
    const { id, ...updateData } = productData;

    try {
      return await productsAPI.updateProduct(id, updateData);
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id: number): Promise<DeleteResponse> {
    try {
      return await productsAPI.deleteProduct(id);
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all product categories
   */
  async getCategories(): Promise<string[]> {
    try {
      return await productsAPI.getCategories();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get categories with details
   */
  async getCategoriesWithDetails(): Promise<Array<{slug: string, name: string, url: string}>> {
    try {
      return await httpClient.get<Array<{slug: string, name: string, url: string}>>(
        `${this.BASE_ENDPOINT}/categories`
      );
    } catch (error) {
      console.error('Failed to fetch categories with details:', error);
      throw error;
    }
  }

  /**
   * Get sortable fields untuk products
   */
  getSortableFields() {
    return [
      { value: 'title', label: 'Title' },
      { value: 'price', label: 'Price' },
      { value: 'rating', label: 'Rating' },
      { value: 'stock', label: 'Stock' },
      { value: 'discountPercentage', label: 'Discount' },
      { value: 'brand', label: 'Brand' },
    ];
  }

  /**
   * Validate product data sebelum create/update
   */
  validateProductData(data: ProductCreateRequest | ProductUpdateRequest): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Title is required');
    }

    if (data.price !== undefined && (data.price <= 0 || isNaN(data.price))) {
      errors.push('Price must be a positive number');
    }

    if (data.title && data.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters');
    }

    return errors;
  }

  /**
   * Format price untuk display
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return apiUtils.formatPrice(price, currency);
  }

  /**
   * Calculate discounted price
   */
  calculateDiscountedPrice(price: number, discountPercentage: number): number {
    return apiUtils.calculateDiscountedPrice(price, discountPercentage);
  }
}

// Singleton instance
export const productsService = new ProductsService();

// Helper functions untuk convenience
export const {
  getProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getCategoriesWithDetails,
  getSortableFields,
  validateProductData,
  formatPrice,
  calculateDiscountedPrice,
} = productsService;
