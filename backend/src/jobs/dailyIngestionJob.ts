/**
 * Daily Ingestion Job
 * Runs automatically at 00:00 (midnight)
 */
import { validateDynatraceConfig } from '../config/dynatrace.config';
import { dynatraceService } from '../services/dynatraceService';
import { dynatraceSyncService } from '../services/dynatraceSyncService';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';

/**
 * Run daily ingestion job
 */
export async function runDailyIngestionJob(): Promise<void> {
  const jobStartTime = new Date();
  
  try {
    logger.section('Daily Ingestion Job Started');
    logger.info(`[JOB] Execution time: ${jobStartTime.toISOString()}`);

    // 1. Validate configuration
    const validation = validateDynatraceConfig();
    if (!validation.valid) {
      logger.error('[JOB] Configuration validation failed:');
      validation.errors.forEach(err => logger.error(`  - ${err}`));
      throw new Error('Invalid configuration');
    }

    // 2. Test Dynatrace connection
    const connectionOk = await dynatraceService.testConnection();
    if (!connectionOk) {
      throw new Error('Dynatrace connection failed');
    }

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-uno';

    // 3. Initialize MongoDB
    await dynatraceSyncService.initMongoDB(MONGODB_URI, COLLECTION_NAME, MONGODB_DB_NAME);

    // 4. Create indexes
    await dynatraceSyncService.ensureIndexes();

    // 5. Execute sync
    const stats = await dynatraceSyncService.syncProblems();

    // 6. Get database stats
    const dbStats = await dynatraceSyncService.getStats();

    // Log results
    logger.section('Daily Job Complete');
    logger.stat('Inserted', stats.inserted);
    logger.stat('Updated', stats.updated);
    logger.stat('Failed', stats.failed);
    logger.stat('Retention executed', stats.retentionExecuted ? 'Yes' : 'No');
    logger.stat('Storage usage', `${stats.storageUsageGB.toFixed(2)} GB`);
    logger.stat('Total problems in DB', dbStats.totalProblems);
    logger.stat('Open problems', dbStats.openProblems);

  } catch (error: any) {
    logger.failure(`Job failed: ${error.message}`);
    throw error;
  } finally {
    await dynatraceSyncService.close();
  }
}

export default runDailyIngestionJob;
