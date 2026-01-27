/**
 * Ingestion Configuration
 * Controls automatic data ingestion from Dynatrace
 */
import dotenv from "dotenv";

dotenv.config();

export interface IngestionConfig {
  // Dates
  startDate: Date;
  lastSyncDate: Date;
  retentionDays: number;

  // Limits
  maxProblemsPerRun: number;
  maxConcurrentRequests: number;

  // Storage
  maxStorageGB: number;
  warningThresholdPercent: number;

  // Scheduling
  dailyRunTime: string;
  retentionRunTime: string;
  reconciliationFrequencyHours: number;

  // Behavior
  incrementalSync: boolean;
  deduplicateData: boolean;
  archiveOldData: boolean;

  // Logging
  logLevel: string;
  logDetailedMetrics: boolean;
}

export const ingestionConfig: IngestionConfig = {
  // Start from next midnight
  startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  lastSyncDate: new Date(),
  retentionDays: parseInt(process.env.INGESTION_RETENTION_DAYS || "90"),

  // Limits
  maxProblemsPerRun: parseInt(process.env.INGESTION_MAX_PROBLEMS || "500"),
  maxConcurrentRequests: parseInt(process.env.INGESTION_MAX_CONCURRENT || "5"),

  // Storage (100 GB maximum)
  maxStorageGB: parseInt(process.env.INGESTION_MAX_STORAGE_GB || "100"),
  warningThresholdPercent: parseInt(
    process.env.INGESTION_WARNING_THRESHOLD || "80",
  ),

  // Scheduling
  dailyRunTime: process.env.INGESTION_DAILY_TIME || "00:00",
  retentionRunTime: process.env.INGESTION_RETENTION_TIME || "02:00",
  reconciliationFrequencyHours: parseInt(
    process.env.INGESTION_RECONCILIATION_HOURS || "24",
  ),

  // Behavior
  incrementalSync: process.env.INGESTION_INCREMENTAL !== "false",
  deduplicateData: process.env.INGESTION_DEDUPLICATE !== "false",
  archiveOldData: process.env.INGESTION_ARCHIVE !== "false",

  // Logging
  logLevel: process.env.INGESTION_LOG_LEVEL || "info",
  logDetailedMetrics: process.env.INGESTION_LOG_METRICS === "true",
};

export default ingestionConfig;
