import apiClient from '@/lib/api/client';
import { ApiResponse } from '@/types/api.types';

export interface FilterOptions {
  impactLevels: string[];
  severityLevels: string[];
  statuses: string[];
  managementZones: string[];
  entityTypes: string[];
  evidenceTypes: string[];
  tags: string[];
  squads: any[];
}

export const filtersApi = {
  getOptions: async (): Promise<FilterOptions> => {
    const response = await apiClient.get<ApiResponse<FilterOptions>>('/filters/options');
    return (response as any).data;
  },
};
