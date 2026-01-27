/**
 * Retention Configuration
 * Data retention and archival policy settings
 */
import dotenv from 'dotenv';

dotenv.config();

export interface RetentionConfig {
  // Retention policy
  retentionDays: number;
  archiveAfterDays: number;
  deleteAfterDays: number;
  
  // Collections
  activeCollection: string;
  archiveCollection: string;
  
  // Execution
  autoCleanupEnabled: boolean;
  batchSize: number;
  
  // Alerts (disabled - Slack omitted per user request)
  alertOnCleanup: boolean;
}

export const retentionConfig: RetentionConfig = {
  retentionDays: parseInt(process.env.RETENTION_DAYS || '90'),
  archiveAfterDays: parseInt(process.env.ARCHIVE_AFTER_DAYS || '90'),
  deleteAfterDays: parseInt(process.env.DELETE_AFTER_DAYS || '180'),
  
  // Using existing project collection
  activeCollection: process.env.MONGODB_COLLECTION_NAME || 'problems',
  archiveCollection: process.env.RETENTION_ARCHIVE_COLLECTION || 'problems-archive',
  
  autoCleanupEnabled: process.env.RETENTION_AUTO_CLEANUP !== 'false',
  batchSize: parseInt(process.env.RETENTION_BATCH_SIZE || '1000'),
  
  // Alerts disabled
  alertOnCleanup: false
};

export default retentionConfig;
