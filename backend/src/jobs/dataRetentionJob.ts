/**
 * Data Retention Job
 * Runs automatically at 02:00 (2 AM)
 */
import { RetentionService } from '../services/retentionService';
import { dynatraceSyncService } from '../services/dynatraceSyncService';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';

/**
 * Run data retention job
 */
export async function runDataRetentionJob(): Promise<void> {
  const jobStartTime = new Date();

  try {
    logger.section('Data Retention Job Started');
    logger.info(`[RETENTION-JOB] Execution time: ${jobStartTime.toISOString()}`);

    // 1. Initialize MongoDB
    await dynatraceSyncService.initMongoDB(MONGODB_URI, COLLECTION_NAME);

    // 2. Get database reference and create retention service
    const db = (dynatraceSyncService as any).db;
    if (!db) {
      throw new Error('Database not initialized');
    }

    const retentionService = new RetentionService(db);

    // 3. Execute retention policy
    const stats = await retentionService.executeRetentionPolicy();

    logger.section('Retention Job Complete');
    logger.stat('Duplicates removed', stats.duplicatesRemoved);
    logger.stat('Documents archived', stats.archived);
    logger.stat('Documents deleted', stats.deleted);
    logger.stat('Storage freed', `${stats.storageFreedGB.toFixed(2)} GB`);

  } catch (error: any) {
    logger.failure(`Retention job failed: ${error.message}`);
    throw error;
  } finally {
    await dynatraceSyncService.close();
  }
}

export default runDataRetentionJob;
