/**
 * Retention Service
 * Manages data retention, archival, and cleanup
 */
import { Db, Collection } from 'mongodb';
import { retentionConfig } from '../config/retention.config';
import logger from '../utils/logger';
import { DateHelper } from '../utils/dateHelper';
import { StorageHelper } from '../utils/storageHelper';

export interface RetentionStats {
  archived: number;
  deleted: number;
  duplicatesRemoved: number;
  duration: number;
  storageFreedGB: number;
}

export class RetentionService {
  private db: Db;
  private activeCollection: Collection;
  private archiveCollection: Collection;

  constructor(db: Db) {
    this.db = db;
    this.activeCollection = db.collection(retentionConfig.activeCollection);
    this.archiveCollection = db.collection(retentionConfig.archiveCollection);
  }

  /**
   * Execute full retention policy
   */
  async executeRetentionPolicy(): Promise<RetentionStats> {
    const startTime = Date.now();
    const stats: RetentionStats = {
      archived: 0,
      deleted: 0,
      duplicatesRemoved: 0,
      duration: 0,
      storageFreedGB: 0
    };

    try {
      logger.section('Retention Policy Execution');

      // 1. Get current storage
      const beforeStats = await StorageHelper.getStorageStats(
        this.db,
        retentionConfig.activeCollection
      );
      logger.info(`[RETENTION] Current storage: ${beforeStats.sizeGB.toFixed(2)} GB`);

      // 2. Remove duplicates 
      stats.duplicatesRemoved = await StorageHelper.removeDuplicates(
        this.activeCollection,
        'dynatraceId'
      );

      // 3. Archive old data
      if (retentionConfig.archiveAfterDays > 0) {
        stats.archived = await this.archiveOldData(retentionConfig.archiveAfterDays);
        logger.info(`[RETENTION] Archived ${stats.archived} documents`);
      }

      // 4. Delete very old archived data
      if (retentionConfig.deleteAfterDays > 0) {
        stats.deleted = await this.deleteVeryOldData(retentionConfig.deleteAfterDays);
        logger.info(`[RETENTION] Deleted ${stats.deleted} archived documents`);
      }

      // 5. Calculate storage freed
      const afterStats = await StorageHelper.getStorageStats(
        this.db,
        retentionConfig.activeCollection
      );
      stats.storageFreedGB = beforeStats.sizeGB - afterStats.sizeGB;
      
      stats.duration = Date.now() - startTime;

      // Log summary
      logger.section('Retention Policy Complete');
      logger.stat('Duplicates removed', stats.duplicatesRemoved);
      logger.stat('Documents archived', stats.archived);
      logger.stat('Documents deleted', stats.deleted);
      logger.stat('Storage freed', `${stats.storageFreedGB.toFixed(2)} GB`);
      logger.stat('Duration', DateHelper.formatDuration(stats.duration));

      return stats;

    } catch (error) {
      logger.error('[RETENTION] Error executing retention policy:', error);
      throw error;
    }
  }

  /**
   * Archive documents older than X days
   */
  private async archiveOldData(daysOld: number): Promise<number> {
    const cutoffDate = DateHelper.getDaysAgo(daysOld);

    try {
      // Find documents to archive
      const cursor = this.activeCollection.find({
        startTime: { $lt: cutoffDate }
      }).batchSize(retentionConfig.batchSize);

      const documentsToArchive = await cursor.toArray();

      if (documentsToArchive.length === 0) {
        logger.info('[RETENTION] No documents to archive');
        return 0;
      }

      // Insert into archive collection
      await this.archiveCollection.insertMany(documentsToArchive);

      // Delete from active collection
      const result = await this.activeCollection.deleteMany({
        startTime: { $lt: cutoffDate }
      });

      return result.deletedCount;

    } catch (error) {
      logger.error('[RETENTION] Error archiving old data:', error);
      throw error;
    }
  }

  /**
   * Delete very old archived documents
   */
  private async deleteVeryOldData(daysOld: number): Promise<number> {
    const cutoffDate = DateHelper.getDaysAgo(daysOld);

    try {
      const result = await this.archiveCollection.deleteMany({
        startTime: { $lt: cutoffDate }
      });

      return result.deletedCount;

    } catch (error) {
      logger.error('[RETENTION] Error deleting old data:', error);
      throw error;
    }
  }

  /**
   * Get retention statistics
   */
  async getRetentionStats(): Promise<{
    activeCount: number;
    archiveCount: number;
    oldestActiveDate: Date | null;
    oldestArchiveDate: Date | null;
  }> {
    try {
      const activeCount = await this.activeCollection.countDocuments();
      const archiveCount = await this.archiveCollection.countDocuments();

      const oldestActive = await this.activeCollection.findOne(
        {},
        { sort: { startTime: 1 }, projection: { startTime: 1 } }
      );

      const oldestArchive = await this.archiveCollection.findOne(
        {},
        { sort: { startTime: 1 }, projection: { startTime: 1 } }
      );

      return {
        activeCount,
        archiveCount,
        oldestActiveDate: oldestActive?.startTime || null,
        oldestArchiveDate: oldestArchive?.startTime || null
      };

    } catch (error) {
      logger.error('[RETENTION] Error getting stats:', error);
      throw error;
    }
  }
}

export default RetentionService;
