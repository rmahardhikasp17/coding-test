/**
 * Users Service - Single responsibility untuk user data operations
 * Menggunakan DummyJSON API langsung dengan type safety
 */

import { usersAPI, apiUtils } from './api';
import type {
  User,
  UsersResponse,
  UsersListParams,
  SearchParams,
  PaginationParams,
  SortParams
} from '../types/api';

export class UsersService {
  private readonly BASE_ENDPOINT = '/users';

  /**
   * Get all users dengan pagination, search, dan sorting
   */
  async getUsers(params: UsersListParams = {}): Promise<UsersResponse> {
    try {
      return await usersAPI.getUsers(params);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      return await usersAPI.getUserById(id);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Search users by query
   */
  async searchUsers(
    query: string,
    pagination: PaginationParams = {}
  ): Promise<UsersResponse> {
    try {
      return await usersAPI.searchUsers(query, pagination.limit, pagination.skip);
    } catch (error) {
      console.error('Failed to search users:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Filter users by specific key-value pair
   */
  async filterUsers(
    key: string,
    value: string,
    pagination: PaginationParams = {}
  ): Promise<UsersResponse> {
    try {
      return await usersAPI.filterUsers(key, value, pagination.limit, pagination.skip);
    } catch (error) {
      console.error('Failed to filter users:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get available filter options untuk users
   * Helper function untuk get unique values from common filter fields
   */
  getFilterOptions() {
    return {
      gender: ['male', 'female'],
      bloodGroup: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      eyeColor: ['Brown', 'Blue', 'Green', 'Gray', 'Amber', 'Hazel'],
      hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'],
      hairType: ['Straight', 'Wavy', 'Curly', 'Kinky'],
      role: ['admin', 'moderator', 'user'],
    };
  }

  /**
   * Get sortable fields untuk users
   */
  getSortableFields() {
    return [
      { value: 'firstName', label: 'First Name' },
      { value: 'lastName', label: 'Last Name' },
      { value: 'email', label: 'Email' },
      { value: 'age', label: 'Age' },
      { value: 'height', label: 'Height' },
      { value: 'weight', label: 'Weight' },
    ];
  }

  /**
   * Utility function untuk build query parameters
   */
  private buildQueryParams(params: UsersListParams): Record<string, string> {
    const queryParams: Record<string, string> = {};

    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.skip !== undefined) {
      queryParams.skip = params.skip.toString();
    }
    if (params.sortBy) {
      queryParams.sortBy = params.sortBy;
      queryParams.order = params.order || 'asc';
    }

    return queryParams;
  }
}

// Singleton instance
export const usersService = new UsersService();

// Helper functions untuk convenience
export const {
  getUsers,
  getUserById,
  searchUsers,
  filterUsers,
  getFilterOptions,
  getSortableFields,
} = usersService;
