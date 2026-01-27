/**
 * Analytics API
 */
import apiClient from './client';
import { DashboardKPIs, ProblemFilters } from '@/types/problem.types';
import { ApiResponse } from '@/types/api.types';

export const analyticsApi = {
  /**
   * Get dashboard KPIs
   */
  getKPIs: async (filters?: ProblemFilters): Promise<DashboardKPIs> => {
    const response = await apiClient.get<ApiResponse<DashboardKPIs>>('/analytics/kpis', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get time series data
   */
  getTimeSeries: async (granularity: 'day' | 'week' | 'month' = 'day', filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/time-series', {
      params: { granularity, ...filters },
    });
    return (response as any).data;
  },

  /**
   * Get impact vs severity matrix
   */
  getImpactSeverityMatrix: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/impact-severity-matrix', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get top entities
   */
  getTopEntities: async (limit: number = 10, filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/top-entities', {
      params: { limit, ...filters },
    });
    return (response as any).data;
  },

  /**
   * Get management zones
   */
  getManagementZones: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/management-zones', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get remediation funnel
   */
  getRemediationFunnel: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/remediation-funnel', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get duration distribution
   */
  getDurationDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/duration-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get evidence types
   */
  getEvidenceTypes: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/evidence-types', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get root cause analysis (treemap)
   */
  getRootCauseAnalysis: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/root-cause-analysis', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get root cause distribution (pie chart)
   */
  getRootCauseDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/root-cause-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get impact level distribution (doughnut chart)
   */
  getImpactDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/impact-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get severity level distribution (doughnut chart)
   */
  getSeverityDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/severity-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get root cause existence distribution (doughnut chart)
   */
  getHasRootCauseDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/has-root-cause-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get autoremediado distribution (pie chart)
   */
  getAutoremediadoDistribution: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/autoremediado-distribution', {
      params: filters,
    });
    return (response as any).data;
  },

  /**
   * Get autoremediation time series
   */
  getAutoremediationTimeSeries: async (granularity: 'day' | 'week' | 'month' = 'day', filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/autoremediation-timeseries', {
      params: { granularity, ...filters },
    });
    return (response as any).data;
  },

  /**
   * Get average resolution time series
   */
  getAverageResolutionTimeTimeSeries: async (granularity: 'day' | 'week' | 'month' = 'day', filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/avg-resolution-timeseries', {
      params: { granularity, ...filters },
    });
    return (response as any).data;
  },

  /**
   * Get problems hierarchy for sunburst chart
   */
  getProblemsHierarchy: async (filters?: ProblemFilters) => {
    const response = await apiClient.get<ApiResponse<any>>('/analytics/problems-hierarchy', {
      params: filters,
    });
    return (response as any).data;
  },
};
