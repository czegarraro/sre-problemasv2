/**
 * Problems API
 */
import apiClient from './client';
import {
  Problem,
  ProblemFilters,
  PaginatedProblemsResponse,
  FilterOptions,
} from '@/types/problem.types';
import { ApiResponse } from '@/types/api.types';

export interface GetProblemsParams extends ProblemFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const problemsApi = {
  /**
   * Get all problems with filters
   */
  getProblems: async (params: GetProblemsParams): Promise<PaginatedProblemsResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedProblemsResponse>>('/problems', {
      params,
      paramsSerializer: {
        indexes: null, // Use array format: ?status=OPEN&status=CLOSED
      },
    });
    return (response as any).data;
  },

  /**
   * Get problem by ID
   */
  getProblemById: async (problemId: string): Promise<Problem> => {
    const response = await apiClient.get<ApiResponse<{ problem: Problem }>>(`/problems/${problemId}`);
    return (response as any).data.problem;
  },

  /**
   * Update problem status
   */
  updateStatus: async (problemId: string, status: 'OPEN' | 'CLOSED'): Promise<Problem> => {
    const response = await apiClient.patch<ApiResponse<{ problem: Problem }>>(
      `/problems/${problemId}/status`,
      { status }
    );
    return (response as any).data.problem;
  },

  /**
   * Add comment to problem
   */
  addComment: async (problemId: string, content: string): Promise<Problem> => {
    const response = await apiClient.post<ApiResponse<{ problem: Problem }>>(
      `/problems/${problemId}/comments`,
      { content }
    );
    return (response as any).data.problem;
  },

  /**
   * Get filter options
   */
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await apiClient.get<ApiResponse<FilterOptions>>('/filters/options');
    return (response as any).data;
  },
};
