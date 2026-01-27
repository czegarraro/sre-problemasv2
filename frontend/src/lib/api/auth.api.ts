/**
 * Authentication API
 */
import apiClient from './client';
import { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/api.types';

export const authApi = {
  /**
   * Login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return (response as any).data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return (response as any).data.user;
  },
};
