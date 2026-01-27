/**
 * False Positives API
 * API client for False Positive Analysis endpoints
 */
import apiClient from './client';

export interface FPAnalysisFilters {
  dateFrom?: string;
  dateTo?: string;
  managementZones?: string[];
  severityLevels?: string[];
  includeDetails?: boolean;
}

export interface FPSummary {
  totalProblems: number;
  analyzedProblems: number;
  falsePositives: number;
  truePositives: number;
  uncertain: number;
  falsePositiveRate: number;
  autoRemediationRate: number;
  avgFPScore: number;
  dateRange: {
    from: string;
    to: string;
  };
  byClassification: Record<string, number>;
  byDuration: Record<string, number>;
  bySeverity: Record<string, number>;
  byImpact?: Record<string, number>;
  byEntityType?: Record<string, number>;
  byManagementZone?: Record<string, number>;
  byReason: Record<string, number>;
  dailyTrend: Array<{
    date: string;
    total: number;
    falsePositives: number;
    truePositives: number;
    fpRate: number;
  }>;
  topRecurringEntities: Array<{
    entityId: string;
    entityName: string;
    entityType: string;
    totalProblems: number;
    avgDurationMinutes?: number;
    autoRemediationRate?: number;
    falsePositiveRate: number;
    recurrenceScore?: number;
    recommendation?: string;
  }>;
  topFalsePositiveTypes: Array<{
    title: string;
    count: number;
    avgFPScore: number;
  }>;
}

export interface FPDashboardKPIs {
  totalProblems: number;
  falsePositiveRate: number;
  falsePositiveRateChange: number;
  avgResolutionTime: number;
  autoRemediationRate: number;
  topRecurringEntity: {
    name: string;
    count: number;
  } | null;
  alertHealthScore: number;
}

export interface FPWidgetData {
  kpis: FPDashboardKPIs;
  classificationPieChart: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  durationHistogram: Array<{
    range: string;
    count: number;
    fpRate: number;
  }>;
  fpRateTrend: Array<{
    timestamp: string;
    value: number;
    label?: string;
  }>;
  severityMatrix: Array<{
    severity: string;
    total: number;
    fp: number;
    tp: number;
    uncertain: number;
  }>;
}

export const falsePositivesApi = {
  /**
   * Get full analysis with summary and recommendations
   */
  getAnalysis: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives', {
      params: filters,
    });
    // Response interceptor already unwraps response.data
    return response as any;
  },

  /**
   * Get summary only (no problem details)
   */
  getSummary: async (filters?: FPAnalysisFilters): Promise<{ summary: FPSummary; recommendations: string[] }> => {
    const response = await apiClient.get('/analytics/false-positives/summary', {
      params: filters,
    });
    // Response interceptor already unwraps response.data
    // Backend returns: { success, summary, recommendations }
    return response as unknown as { summary: FPSummary; recommendations: string[] };
  },

  /**
   * Get FP rate statistics
   */
  getFPRate: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/rate', {
      params: filters,
    });
    return response as any;
  },

  /**
   * Get dashboard KPIs
   */
  getDashboardKPIs: async (filters?: FPAnalysisFilters): Promise<{ kpis: FPDashboardKPIs }> => {
    const response = await apiClient.get('/analytics/false-positives/dashboard/kpis', {
      params: filters,
    });
    return response as unknown as { kpis: FPDashboardKPIs };
  },

  /**
   * Get all widget data for dashboard
   */
  getWidgetData: async (filters?: FPAnalysisFilters): Promise<FPWidgetData> => {
    const response = await apiClient.get('/analytics/false-positives/dashboard/widgets', {
      params: filters,
    });
    return response as unknown as FPWidgetData;
  },

  /**
   * Get top false positives
   */
  getTopFalsePositives: async (limit: number = 10, filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/problems/top', {
      params: { limit, ...filters },
    });
    return response as any;
  },

  /**
   * Get entity analysis
   */
  getEntityAnalysis: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/entities', {
      params: filters,
    });
    return response as any;
  },

  /**
   * Get daily trend
   */
  getDailyTrend: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/trend/daily', {
      params: filters,
    });
    return response as any;
  },

  /**
   * Get distribution by duration
   */
  getDurationDistribution: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/distribution/duration', {
      params: filters,
    });
    return response as any;
  },

  /**
   * Get distribution by reason
   */
  getReasonDistribution: async (filters?: FPAnalysisFilters) => {
    const response = await apiClient.get('/analytics/false-positives/distribution/reasons', {
      params: filters,
    });
    return response as any;
  },
};

export default falsePositivesApi;
