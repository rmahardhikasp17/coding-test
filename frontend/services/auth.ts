/**
 * Auth Service - Single responsibility untuk authentication operations
 * Menggunakan DummyJSON API langsung dengan clean architecture
 */

import { authAPI, apiUtils } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '../types/api';

export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  /**
   * Login user dengan username dan password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login with:', {
        username: credentials.username,
        hasPassword: !!credentials.password
      });

      const loginData = {
        username: credentials.username,
        password: credentials.password,
        expiresInMins: credentials.expiresInMins || 60,
      };

      console.log('📡 Sending login request via Axios...');
      const response = await authAPI.login(loginData);

      console.log('✅ Login successful:', {
        id: response.id,
        username: response.username,
        email: response.email,
        hasToken: !!response.accessToken
      });

      // Store tokens dan user data
      this.setTokens(response.accessToken, response.refreshToken);
      this.setUserData(response);

      return response;
    } catch (error) {
      console.error('Login failed:', error);

      // Use axios error handling utility
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<LoginResponse> {
    try {
      return await authAPI.getCurrentUser();
    } catch (error) {
      console.error('Get current user failed:', error);
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authAPI.refreshToken({
        refreshToken,
        expiresInMins: 60,
      });

      // Update stored tokens
      this.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout(); // Clear invalid tokens
      const errorMessage = apiUtils.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user dan clear semua stored data
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUserData();
    return !!(token && user);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  getUserData(): LoginResponse | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Initialize auth state (dipanggil saat app startup)
   */
  initializeAuth(): void {
    // Token is automatically added via axios request interceptor
    // No need to manually set auth headers
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Store user data in localStorage
   */
  private setUserData(userData: LoginResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }
}

// Singleton instance
export const authService = new AuthService();

// Helper functions untuk convenience
export const {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  isAuthenticated,
  getAccessToken,
  getUserData,
  initializeAuth,
} = authService;
