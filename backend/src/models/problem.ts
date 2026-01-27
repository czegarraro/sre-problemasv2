import { ObjectId } from 'mongodb';

/**
 * Problema de Dynatrace enriquecido con observabilidad SRE
 */
export interface Problem {
  // Identidad
  _id?: ObjectId;
  dynatraceId: string;  // ID único de Dynatrace
  displayId: string;    // ID para UI
  tenantId?: string;     // Para multi-tenancy

  // Información básica
  title: string;
  description?: string;
  status: ProblemStatus;  // OPEN | CLOSED | RESOLVED
  severity: ProblemSeverity;  // CRITICAL | HIGH | MEDIUM | LOW | INFO
  severityLevel: string; // Dynatrace string level (e.g. "PERFORMANCE") or number if converted

  // Timestamps
  createdAt?: Date;
  startTime: Date;  // Cuándo comenzó
  endTime?: Date | null;   // Cuándo terminó
  detectedAt?: Date; // Cuándo lo detectó Dynatrace
  closedAt?: Date;
  duration: number; // en ms

  // Clasificación automática
  category?: ProblemCategory;
  subcategory?: string;
  isFalsePositive?: boolean;
  falsePositiveReason?: string;
  falsePositiveScore?: number;  // 0-100 (ML model)
  
  // Confianza y calidad
  confidence?: number;  // 0-100
  dataQuality?: DataQuality;
  validatedBy?: string;
  validationTimestamp?: Date;

  // Impacto
  impact?: ImpactAnalysis;
  rootCause?: RootCauseAnalysis;
  correlatedProblems?: string[];  // IDs de problemas correlacionados
  
  // Servicios y entidades afectados
  affectedServices?: AffectedService[];
  affectedApplications?: AffectedApplication[];
  impactedEntities?: ImpactedEntity[];
  affectedEntities?: any[]; // Legacy compatibility
  totalAffectedUsers?: number;
  estimatedRevenueLoss?: number;

  // SLO y error budget
  sloImpact?: SLOImpact;
  errorBudgetImpact?: number;  // Porcentaje de error budget consumido

  // Observabilidad
  metrics?: MetricSnapshot[];
  logs?: LogSnapshot[];
  traces?: TraceSnapshot[];
  events?: TimelineEvent[];
  
  // Tags y contexto
  tags?: Record<string, string>;
  environment?: Environment;
  region?: string;
  tier?: ServiceTier;  // CRITICAL | PRODUCTION | STAGING | DEV

  // Investigación
  investigation?: Investigation;
  playbooks?: PlaybookReference[];
  suggestedActions?: SuggestedAction[];

  // Tracking
  lastSyncAt?: Date;
  syncStatus?: SyncStatus;
  syncCount?: number;
  lastModifiedAt?: Date;
  createdBy?: string;
  modifiedBy?: string;

  // Versioning para auditoría
  version?: number;
  changeLog?: ChangeLogEntry[];
}

// ==================== TIPOS ====================

export type ProblemStatus = 'OPEN' | 'CLOSED' | 'RESOLVED' | 'ACKNOWLEDGED' | 'INVESTIGATING';
export type ProblemSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' | 'CUSTOM_ALERT' | string;
export type ProblemCategory = 
  | 'PERFORMANCE' 
  | 'AVAILABILITY' 
  | 'ERROR_RATE' 
  | 'CAPACITY' 
  | 'CONFIGURATION' 
  | 'SECURITY' 
  | 'ANOMALY' 
  | 'EXTERNAL' 
  | 'UNKNOWN';

export type DataQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'INCOMPLETE';
export type Environment = 'PRODUCTION' | 'STAGING' | 'UAT' | 'DEVELOPMENT';
export type ServiceTier = 'CRITICAL' | 'PRODUCTION' | 'STAGING' | 'DEV';
export type SyncStatus = 'SYNCED' | 'PENDING' | 'FAILED' | 'PARTIALLY_SYNCED';

// ==================== IMPACTO ====================

export interface ImpactAnalysis {
  level: 'APPLICATION' | 'ENVIRONMENT' | 'SERVICE' | 'INFRASTRUCTURE' | 'UNKNOWN';
  affectedUsers: number;
  affectedTransactions: number;
  errorRate: number;  // Porcentaje
  latencyIncrease: number;  // ms
  throughputImpact: number;  // Porcentaje
  estimatedServiceDowntime: number;  // segundos
  businessImpact: string;
  affectedBusinessDomain?: string;
  estimatedCost?: number;  // Costo del impacto
}

export interface RootCauseAnalysis {
  identified: boolean;
  hypothesis: string;
  confidence: number;  // 0-100
  entity: {
    id: string;
    name: string;
    type: string;  // HOST | APPLICATION | SERVICE | DATABASE
  };
  metrics: string[];  // Métricas anómalas
  changes?: Change[];
  analysis: string;
}

export interface AffectedService {
  id: string;
  name: string;
  team?: string;
  owner?: string;
  slack?: string;
  impactType: 'DIRECT' | 'INDIRECT' | 'POTENTIAL';
  errorRate?: number;
  latency?: number;
  throughput?: number;
}

export interface AffectedApplication {
  id: string;
  name: string;
  version?: string;
  environment: Environment;
  errorRate: number;
  users: number;
}

export interface ImpactedEntity {
  id: string;
  name: string;
  type: 'HOST' | 'APPLICATION' | 'SERVICE' | 'DATABASE' | 'CONTAINER';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  impactDuration: number;
}

// ==================== SLO ====================

export interface SLOImpact {
  sloName: string;
  sloTarget: number;  // Porcentaje
  currentCompliance: number;
  impactPercentage: number;
  minutesUntilBreach: number;
  affectedBudget: number;
  budgetRemainingAfter: number;
}

// ==================== OBSERVABILIDAD ====================

export interface MetricSnapshot {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  baseline?: number;
  deviation?: number;
}

export interface LogSnapshot {
  timestamp: Date;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  context?: Record<string, string>;
  relatedMetric?: string;
}

export interface TraceSnapshot {
  traceId: string;
  spanId: string;
  operation: string;
  duration: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
  errorMessage?: string;
}

export interface TimelineEvent {
  timestamp: Date;
  type: 'METRIC_ANOMALY' | 'ERROR_SPIKE' | 'DEPLOYMENT' | 'CONFIG_CHANGE' | 'ALERT' | 'MITIGATION';
  description: string;
  severity: number;
  relatedMetrics?: string[];
}

// ==================== INVESTIGACIÓN ====================

export interface Investigation {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  startedAt?: Date;
  completedAt?: Date;
  assignedTo?: string;
  findings: string;
  suggestedFix?: string;
  similarIncidents: HistoricalIncident[];
}

export interface PlaybookReference {
  id: string;
  name: string;
  url: string;
  relevanceScore: number;
  applicability: 'HIGHLY_RELEVANT' | 'RELEVANT' | 'MARGINALLY_RELEVANT';
}

export interface SuggestedAction {
  priority: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  expectedOutcome: string;
  estimatedTimeToFix: number;  // segundos
  automationAvailable: boolean;
  automationUrl?: string;
}

export interface Change {
  timestamp: Date;
  type: 'DEPLOYMENT' | 'CONFIG_CHANGE' | 'INFRASTRUCTURE' | 'DEPENDENCY';
  description: string;
  impact: 'POTENTIAL_CAUSE' | 'CONTRIBUTING_FACTOR' | 'UNRELATED';
}

export interface HistoricalIncident {
  id: string;
  title: string;
  similarity: number;  // 0-100
  timeToResolve: number;
  resolution: string;
}

export interface ChangeLogEntry {
  timestamp: Date;
  changedBy: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

/**
 * Agregación por hora para análisis de tendencias
 */
export interface HourlyAggregate {
  _id?: ObjectId;
  hour: Date;
  
  // Conteos
  totalProblems: number;
  newProblems: number;
  resolvedProblems: number;
  falsePositives: number;
  
  // Severidad
  critical: number;
  high: number;
  medium: number;
  low: number;
  
  // Métricas
  averageDuration: number;
  averageAffectedUsers: number;
  totalErrorBudgetImpact: number;
  
  // Categorías
  byCategory: Record<string, number>;
  byEnvironment: Record<string, number>;
  
  // Tendencias
  trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  trendPercentage: number;
  
  createdAt: Date;
}

/**
 * Validacion de problemas
 */
export interface ProblemValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  qualityScore: number;
}


/**
 * Patrones de falsos positivos
 */
export interface FalsePositivePattern {
  _id?: ObjectId;
  pattern: string;
  reason: string;
  confidence: number;  // 0-100
  frequency: number;
  lastOccurrence: Date;
  shouldAutoSuppress: boolean;
  suppressThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}
