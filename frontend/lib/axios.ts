/**
 * Axios-compatible HTTP client implementation
 * Provides identical interface to axios library using fetch API
 */

export interface AxiosRequestConfig {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  validateStatus?: (status: number) => boolean;
}

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
  request?: any;
}

export interface AxiosError {
  message: string;
  code?: string;
  config?: AxiosRequestConfig;
  request?: any;
  response?: AxiosResponse;
  isAxiosError: true;
}

export interface AxiosInstance {
  defaults: AxiosRequestConfig;
  interceptors: {
    request: {
      use: (onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig, onRejected?: (error: any) => any) => number;
      eject: (id: number) => void;
    };
    response: {
      use: (onFulfilled?: (response: AxiosResponse) => AxiosResponse, onRejected?: (error: any) => any) => number;
      eject: (id: number) => void;
    };
  };
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

class AxiosImplementation implements AxiosInstance {
  public defaults: AxiosRequestConfig = {
    baseURL: '',
    headers: {},
    timeout: 0,
    validateStatus: (status: number) => status >= 200 && status < 300,
  };

  public interceptors = {
    request: {
      handlers: [] as Array<{
        fulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig;
        rejected?: (error: any) => any;
      }>,
      use: (onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig, onRejected?: (error: any) => any): number => {
        this.interceptors.request.handlers.push({
          fulfilled: onFulfilled,
          rejected: onRejected,
        });
        return this.interceptors.request.handlers.length - 1;
      },
      eject: (id: number): void => {
        if (this.interceptors.request.handlers[id]) {
          this.interceptors.request.handlers[id] = {} as any;
        }
      },
    },
    response: {
      handlers: [] as Array<{
        fulfilled?: (response: AxiosResponse) => AxiosResponse;
        rejected?: (error: any) => any;
      }>,
      use: (onFulfilled?: (response: AxiosResponse) => AxiosResponse, onRejected?: (error: any) => any): number => {
        this.interceptors.response.handlers.push({
          fulfilled: onFulfilled,
          rejected: onRejected,
        });
        return this.interceptors.response.handlers.length - 1;
      },
      eject: (id: number): void => {
        if (this.interceptors.response.handlers[id]) {
          this.interceptors.response.handlers[id] = {} as any;
        }
      },
    },
  };

  private mergeConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.defaults,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaults.headers,
        ...config.headers,
      },
    };
  }

  private buildURL(baseURL: string, url: string, params?: Record<string, any>): string {
    const fullURL = baseURL && url ? `${baseURL}${url}` : url || baseURL || '';
    
    if (!params) return fullURL;
    
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, String(params[key]));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  private async processRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    let processedConfig = config;
    
    // Apply request interceptors
    for (const handler of this.interceptors.request.handlers) {
      if (handler.fulfilled) {
        try {
          processedConfig = handler.fulfilled(processedConfig);
        } catch (error) {
          if (handler.rejected) {
            handler.rejected(error);
          }
          throw error;
        }
      }
    }
    
    return processedConfig;
  }

  private async processResponse(response: AxiosResponse): Promise<AxiosResponse> {
    let processedResponse = response;
    
    // Apply response interceptors
    for (const handler of this.interceptors.response.handlers) {
      if (handler.fulfilled) {
        try {
          processedResponse = handler.fulfilled(processedResponse);
        } catch (error) {
          if (handler.rejected) {
            return handler.rejected(error);
          }
          throw error;
        }
      }
    }
    
    return processedResponse;
  }

  private createAxiosError(message: string, config: AxiosRequestConfig, response?: Response): AxiosError {
    const error: AxiosError = {
      message,
      isAxiosError: true,
      config,
    };

    if (response) {
      error.response = {
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: {},
        config,
      };
    }

    return error;
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const mergedConfig = this.mergeConfig(config);
    const processedConfig = await this.processRequest(mergedConfig);
    
    const url = this.buildURL(
      processedConfig.baseURL || '',
      processedConfig.url || '',
      processedConfig.params
    );

    const fetchConfig: RequestInit = {
      method: processedConfig.method || 'GET',
      headers: processedConfig.headers,
      mode: 'cors',
    };

    if (processedConfig.data && ['POST', 'PUT', 'PATCH'].includes(processedConfig.method || '')) {
      fetchConfig.body = typeof processedConfig.data === 'string' 
        ? processedConfig.data 
        : JSON.stringify(processedConfig.data);
    }

    try {
      const response = await fetch(url, fetchConfig);
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }

      const axiosResponse: AxiosResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config: processedConfig,
        request: response,
      };

      const validateStatus = processedConfig.validateStatus || this.defaults.validateStatus!;
      if (!validateStatus(response.status)) {
        const error = this.createAxiosError(
          `Request failed with status code ${response.status}`,
          processedConfig,
          response
        );
        error.response!.data = data;
        
        // Process error through response interceptors
        for (const handler of this.interceptors.response.handlers) {
          if (handler.rejected) {
            try {
              return await handler.rejected(error);
            } catch (interceptorError) {
              throw interceptorError;
            }
          }
        }
        
        throw error;
      }

      return await this.processResponse(axiosResponse);
    } catch (error) {
      if ((error as any).isAxiosError) {
        throw error;
      }
      
      const axiosError = this.createAxiosError(
        error instanceof Error ? error.message : 'Network Error',
        processedConfig
      );
      
      // Process error through response interceptors
      for (const handler of this.interceptors.response.handlers) {
        if (handler.rejected) {
          try {
            return await handler.rejected(axiosError);
          } catch (interceptorError) {
            throw interceptorError;
          }
        }
      }
      
      throw axiosError;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'HEAD', url });
  }

  async options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'OPTIONS', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }
}

// Create axios instance
function createAxiosInstance(config?: AxiosRequestConfig): AxiosInstance {
  const instance = new AxiosImplementation();
  if (config) {
    Object.assign(instance.defaults, config);
  }
  return instance;
}

// Default axios instance
const axios = createAxiosInstance();

// Export axios object with create method
export default {
  ...axios,
  create: createAxiosInstance,
  isAxiosError: (payload: any): payload is AxiosError => {
    return payload && payload.isAxiosError === true;
  },
};

// Named exports for compatibility
export const {
  request,
  get,
  delete: del,
  head,
  options,
  post,
  put,
  patch,
} = axios;

export { createAxiosInstance as create };
