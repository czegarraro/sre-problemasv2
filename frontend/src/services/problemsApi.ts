import { apiClient } from '../lib/api/client';
import { DynatraceProblem, SREMetrics } from '../types/problem';

// Removed API_URL and api creation since they are handled in client.ts

export const problemsApi = {
  // SRE Dashboard endpoints
  getOverview: async (): Promise<SREMetrics> => {
    // apiClient unwraps response.data locally
    const response = await apiClient.get<any, any>('/dashboard/sre/overview');
    return response.data.overview;
  },

  getDetailedProblems: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    fpOnly?: boolean;
  }): Promise<{ data: DynatraceProblem[]; pagination: any }> => {
    return await apiClient.get('/dashboard/sre/problems/detailed', { params });
  },

  getTrends: async () => {
    const response = await apiClient.get<any, any>('/dashboard/sre/analytics/trends');
    return response.data;
  },

  validateFalsePositive: async (id: string, isFalsePositive: boolean, reason: string) => {
    return await apiClient.post(`/dashboard/sre/problems/${id}/validate-fp`, {
      isFalsePositive,
      reason,
    });
  },
  
  // Legacy/Other endpoints
  getProblem: async (id: string) => {
    return await apiClient.get(`/problems/${id}`);
  }
};
