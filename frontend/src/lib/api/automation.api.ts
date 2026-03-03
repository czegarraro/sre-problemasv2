import { apiClient } from './client';

export interface Runbook {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface AutomationHistory {
  id: string;
  timestamp: string;
  problemId: string;
  runbookName: string;
  entity: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  savings: number;
  logs: string[];
}

export interface AutomationStats {
  totalSavings: number;
  hoursSaved: number;
  remediationsCount: number;
  successRate: number;
}

export const automationApi = {
  getRunbooks: async (): Promise<Runbook[]> => {
    const response = await apiClient.get('/automation/runbooks');
    return response.data || [];
  },

  getHistory: async (): Promise<AutomationHistory[]> => {
    const response = await apiClient.get('/automation/history');
    return response.data || [];
  },

  getStats: async (): Promise<AutomationStats | null> => {
    const response = await apiClient.get('/automation/stats');
    return response.data || null;
  }
};
