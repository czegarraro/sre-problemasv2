/**
 * Filters API
 */
import apiClient from './client';
import { ApiResponse } from '@/types/api.types';

interface FilterOptionsResponse {
  severityLevels: string[];
  impactLevels: string[];
  statuses: string[];
  managementZones: string[];
  affectedEntityTypes: string[];
  evidenceTypes: string[];
  titles: string[];
}

/**
 * Get available filter options
 */
export const getFilterOptions = async (): Promise<FilterOptionsResponse> => {
  const response = await apiClient.get<ApiResponse<FilterOptionsResponse>>('/filters/options');
  return (response as any).data;
};
