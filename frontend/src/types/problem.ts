export interface DynatraceProblem {
  id: string; // Internal MongoDB ID
  dynatraceId: string;
  displayId: string;
  title: string;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  severityLevel: string;
  impactLevel: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  duration: number; // in milliseconds
  
  // Impact
  affectedEntities: Array<{
    entityId: { id: string; type: string };
    name: string;
  }>;
  impactedEntities?: Array<{
    entityId: { id: string; type: string };
    name: string;
  }>;
  affectedUsers?: number;
  
  // SRE Fields
  isFalsePositive?: boolean;
  falsePositiveScore?: number;
  falsePositiveReason?: string;
  category?: string;
  
  // RCA
  rootCause?: {
    hypothesis: string;
    confidence: number;
    entity: any;
    analysis: string;
  };
  
  // SLO
  sloImpact?: {
    impactPercentage: number;
    sloName: string;
  };

  // Additional data
  evidenceDetails?: {
    totalCount: number;
    details: any[];
  };
  Autoremediado?: string;
  FuncionoAutoRemediacion?: string;
}

export interface SREMetrics {
  total: number;
  critical: number;
  high: number;
  falsePositives: number;
  fpRate: string;
  averageDuration: number;
  trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  trendPercentage: number;
}
