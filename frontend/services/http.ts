/**
 * HTTP Client - Single responsibility untuk handle semua HTTP requests
 * Menggunakan fetch API dengan error handling dan type safety
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = 'https://dummyjson.com') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: ApiError = {
        code: errorData.code || 'HTTP_ERROR',
        message: errorData.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      mode: 'cors',
      // Don't send credentials for external APIs like DummyJSON
      ...options,
    };

    try {
      console.log(`📡 ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      console.log(`✅ Response: ${response.status} ${response.statusText}`);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ Request failed for ${url}:`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to the server. Please check your internet connection.',
          status: 0,
        } as ApiError;
      }

      if (error instanceof Error && !(error as any).status) {
        throw {
          code: 'NETWORK_ERROR',
          message: `Network error: ${error.message}`,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }
}

// Singleton instance
export const httpClient = new HttpClient();
