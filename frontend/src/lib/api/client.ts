/**
 * API Client Configuration
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api.types';

// Use relative path for API calls - Vercel rewrites will handle routing to backend
const API_BASE_URL = '/api/v1';

/**
 * Create axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage if exists
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Request with token:', config.method?.toUpperCase(), config.url);
    } else {
      console.warn('[API Client] Request without token:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from ApiResponse wrapper
    console.log('[API Client] Response success:', response.status, response.config.url);
    return response.data;
  },
  (error: AxiosError<ApiError>) => {
    // Handle errors
    console.error('[API Client] Response error:', error.message, error.config?.url);
    
    if (error.response) {
      const apiError = error.response.data;
      console.error('[API Client] Error details:', error.response.status, apiError);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.warn('[API Client] Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject(apiError);
    }

    // Network error
    console.error('[API Client] Network error - backend might be down');
    return Promise.reject({
      error: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      statusCode: 0,
    } as ApiError);
  }
);

export default apiClient;
