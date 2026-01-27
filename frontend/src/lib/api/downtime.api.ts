import { apiClient } from './client';

export interface SeverityStats {
  count: number;
  hours: number;
}

export interface MonthlySummary {
  month: string;
  problems: number;
  hours: number;
  downtimePercent: number;
  bySeverity: Record<string, SeverityStats>;
}

export interface TopProblem {
  title: string;
  displayId: string;
  severity: string;
  durationHours: number;
  startTime: string;
  affectedService: string;
}

export interface DowntimeStats {
  totalProblems: number;
  totalHours: number;
  downtimePercent: number;
  monthlySummary: MonthlySummary[];
  severityDistribution: Record<string, SeverityStats>;
  topProblems: TopProblem[];
}

export const downtimeApi = {
  /**
   * Get downtime statistics for a date range
   */
  async getDowntimeStats(startDate: string, endDate: string): Promise<DowntimeStats> {
    return await apiClient.get<any, DowntimeStats>('/analytics/downtime', {
      params: { startDate, endDate }
    });
  }
};
