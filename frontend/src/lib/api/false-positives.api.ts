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

  // ============================================================================
  // PHASE 2.5: ADVANCED SRE HEURISTICS
  // ============================================================================

  /**
   * Get chronic offenders (entities with >3 alerts in 24h)
   */
  getChronicOffenders: async (limit: number = 10): Promise<ChronicOffendersResponse> => {
    const response = await apiClient.get('/analytics/false-positives/chronic-offenders', {
      params: { limit },
    });
    return response as unknown as ChronicOffendersResponse;
  },

  /**
   * Get Phase 2.5 summary (flapping + maintenance stats)
   */
  getPhase25Summary: async (): Promise<Phase25SummaryResponse> => {
    const response = await apiClient.get('/analytics/false-positives/phase25-summary');
    return response as unknown as Phase25SummaryResponse;
  },

  /**
   * Get maintenance window alerts count
   */
  getMaintenanceAlerts: async (days: number = 30): Promise<MaintenanceAlertsResponse> => {
    const response = await apiClient.get('/analytics/false-positives/maintenance-alerts', {
      params: { days },
    });
    return response as unknown as MaintenanceAlertsResponse;
  },
};

// ============================================================================
// PHASE 2.5 INTERFACES
// ============================================================================

export interface ChronicOffender {
  entityId: string;
  entityName: string;
  alertCount: number;
  lastTitle: string;
  lastOccurrence: string;
  isFlapping: boolean;
}

export interface ChronicOffendersResponse {
  success: boolean;
  data: ChronicOffender[];
  count: number;
  windowHours: number;
}

export interface Phase25Summary {
  chronicOffenders: ChronicOffender[];
  maintenanceWindowAlerts: number;
  flappingEntityCount: number;
  maintenanceNoisePercent: number;
}

export interface Phase25SummaryResponse {
  success: boolean;
  data: Phase25Summary;
}

export interface MaintenanceAlertsResponse {
  success: boolean;
  data: {
    maintenanceWindowAlerts: number;
    periodDays: number;
    maintenanceWindow: string;
  };
}

export default falsePositivesApi;

