/**
 * Dynatrace Sync Service
 * Orchestrates synchronization between Dynatrace and MongoDB
 */
import { MongoClient, Db, Collection } from 'mongodb';
import { dynatraceService } from './dynatraceService';
import { RetentionService } from './retentionService';
import { ingestionConfig } from '../config/ingestion.config';
import { retentionConfig } from '../config/retention.config';
import logger from '../utils/logger';
import { DateHelper } from '../utils/dateHelper';
import { StorageHelper } from '../utils/storageHelper';

export interface SyncStats {
  totalProblems: number;
  inserted: number;
  updated: number;
  failed: number;
  skipped: number;
  duplicatesRemoved: number;
  duration: number;
  startTime: Date;
  endTime: Date;
  storageUsageGB: number;
  retentionExecuted: boolean;
}

export interface DbStats {
  totalProblems: number;
  openProblems: number;
  criticalProblems: number;
  bySeverity: Record<string, number>;
  lastSync: Date | null;
  storage: {
    sizeGB: number;
    documentCount: number;
    averageDocumentSize: number;
  };
}

class DynatraceSyncService {
  private mongoClient: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection | null = null;
  private retentionService: RetentionService | null = null;

  /**
   * Initialize MongoDB connection
   */
  async initMongoDB(mongoUri: string, collectionName: string, dbName?: string): Promise<void> {
    try {
      logger.info(`[SYNC] Initializing MongoDB connection (DB: ${dbName || 'default'})...`);
      
      this.mongoClient = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
        connectTimeoutMS: 60000,
        maxPoolSize: 10
      });
      
      await this.mongoClient.connect();
      this.db = this.mongoClient.db(dbName);
      this.collection = this.db.collection(collectionName);
      this.retentionService = new RetentionService(this.db);

      logger.success('MongoDB connected');
      
    } catch (error) {
      logger.error('[SYNC] MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * Create optimized indexes
   */
  async ensureIndexes(): Promise<void> {
    if (!this.collection) throw new Error('Collection not initialized');

    try {
      logger.info('[SYNC] Creating/updating indexes...');

      // Primary indexes
      await this.collection.createIndex({ dynatraceId: 1 }, { unique: true, sparse: true });
      await this.collection.createIndex({ displayId: 1 });
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ severityLevel: 1 });
      await this.collection.createIndex({ startTime: -1 });
      await this.collection.createIndex({ endTime: -1 });
      await this.collection.createIndex({ lastSyncAt: -1 });
      await this.collection.createIndex({ syncStatus: 1 });

      // Compound indexes for common queries
      await this.collection.createIndex({ status: 1, severityLevel: -1 });
      await this.collection.createIndex({ startTime: -1, severityLevel: 1 });
      await this.collection.createIndex({ 'affectedEntities.entityId.type': 1 });
      await this.collection.createIndex({ 'managementZones.name': 1 });

      logger.success('Indexes created/updated');
      
    } catch (error) {
      logger.warn('[SYNC] Index creation warning:', error);
    }
  }

  /**
   * Check storage and run retention if needed
   */
  private async checkStorageAndCleanup(): Promise<{ cleaned: boolean; duplicatesRemoved: number }> {
    if (!this.db || !this.retentionService) {
      return { cleaned: false, duplicatesRemoved: 0 };
    }

    const storageCheck = await StorageHelper.isStorageLimitReached(
      this.db,
      retentionConfig.activeCollection,
      ingestionConfig.maxStorageGB,
      ingestionConfig.warningThresholdPercent
    );

    if (storageCheck.warning) {
      logger.warn(`[SYNC] ⚠️ Storage usage at ${storageCheck.usage.toFixed(1)}%`);
    }

    if (storageCheck.reached) {
      logger.error('[SYNC] ❌ Storage limit reached! Executing retention policy...');
      const retentionStats = await this.retentionService.executeRetentionPolicy();
      return { cleaned: true, duplicatesRemoved: retentionStats.duplicatesRemoved };
    }

    return { cleaned: false, duplicatesRemoved: 0 };
  }

  /**
   * Sync problems from Dynatrace to MongoDB
   */
  async syncProblems(): Promise<SyncStats> {
    if (!this.collection || !this.db) {
      throw new Error('Services not initialized. Call initMongoDB first.');
    }

    const stats: SyncStats = {
      totalProblems: 0,
      inserted: 0,
      updated: 0,
      failed: 0,
      skipped: 0,
      duplicatesRemoved: 0,
      duration: 0,
      startTime: new Date(),
      endTime: new Date(),
      storageUsageGB: 0,
      retentionExecuted: false
    };

    try {
      logger.section('Dynatrace Sync Started');

      // 1. Check storage capacity
      logger.info('[SYNC] Checking storage capacity...');
      const cleanup = await this.checkStorageAndCleanup();
      stats.retentionExecuted = cleanup.cleaned;
      stats.duplicatesRemoved = cleanup.duplicatesRemoved;

      // Get current storage usage
      const storageStats = await StorageHelper.getStorageStats(
        this.db,
        retentionConfig.activeCollection
      );
      stats.storageUsageGB = storageStats.sizeGB;

      // 2. Get date range (last 90 days)
      const dateRange = DateHelper.getLastNDaysRange(ingestionConfig.retentionDays);
      logger.info(`[SYNC] Date range: ${DateHelper.formatForLog(dateRange.start)} to ${DateHelper.formatForLog(dateRange.end)}`);

      // 3. Fetch problems from Dynatrace
      logger.info('[SYNC] Phase 1: Fetching problems from Dynatrace...');
      const problems = await dynatraceService.fetchProblems({
        from: dateRange.start,
        to: dateRange.end
      });
      stats.totalProblems = problems.length;

      if (problems.length === 0) {
        logger.warn('[SYNC] No problems found in the date range');
        stats.endTime = new Date();
        stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
        return stats;
      }

      logger.info(`[SYNC] ✓ Fetched ${problems.length} problems`);

      // 4. Enrich with details
      logger.info('[SYNC] Phase 2: Enriching problems with details...');
      const enrichedProblems = await dynatraceService.enrichProblemsWithDetails(
        problems,
        ingestionConfig.maxConcurrentRequests
      );

      // 5. Transform to MongoDB format
      logger.info('[SYNC] Phase 3: Transforming problems...');
      let transformedProblems = enrichedProblems.map(p => 
        dynatraceService.transformProblem(p)
      );

      // 5b. SRE Enrichment (New Phase)
      logger.info('[SYNC] Phase 3b: SRE Enrichment (FP Detection & Correlation)...');
      try {
        const { default: fpService } = await import('./falsePositiveDetectionService');
        // const { default: correlationService } = await import('./correlationService'); // Optional: Enable if performance allows

        transformedProblems = await Promise.all(transformedProblems.map(async (prob) => {
          // Detect False Positives
          // @ts-ignore - Problem type compatibility
          const fpAnalysis = await fpService.analyzeProblem(prob);
          
          return {
            ...prob,
            isFalsePositive: fpAnalysis.isFalsePositive,
            falsePositiveScore: fpAnalysis.score,
            falsePositiveReason: fpAnalysis.reasons.join('; '),
            category: prob.title.includes('Failure') ? 'ERROR_RATE' : 'AVAILABILITY', // Simple categorization
            // correlation: ... (would go here)
          };
        }));
      } catch (err: any) { 
        logger.error(`[SYNC] SRE Enrichment failed: ${err.message}`);
        // Continue without enrichment if fails
      }

      // 6. Upsert to MongoDB
      logger.info('[SYNC] Phase 4: Syncing to MongoDB (upsert)...');
      
      for (const problem of transformedProblems) {
        try {
          // Remove syncCount from $set to avoid conflict with $inc
          const problemData = { ...problem };
          // @ts-ignore
          delete problemData.syncCount;

          const result = await this.collection.updateOne(
            { dynatraceId: problem.dynatraceId },
            {
              $set: {
                ...problemData,
                lastSyncAt: new Date(),
                syncStatus: 'SYNCED'
              },
              $inc: { syncCount: 1 },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            { upsert: true }
          );

          if (result.upsertedId) {
            stats.inserted++;
          } else if (result.modifiedCount > 0) {
            stats.updated++;
          } else {
            stats.skipped++;
          }

        } catch (error: any) {
          stats.failed++;
          if (error.code !== 11000) { // Ignore duplicate key errors
            logger.error(`[SYNC] Failed to sync ${problem.dynatraceId}: ${error.message}`);
          }
        }
      }

      // 7. Calculate final stats
      stats.endTime = new Date();
      stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

      // Log summary
      logger.section('Sync Complete');
      logger.stat('Total problems', stats.totalProblems);
      logger.stat('Inserted', stats.inserted);
      logger.stat('Updated', stats.updated);
      logger.stat('Failed', stats.failed);
      logger.stat('Skipped', stats.skipped);
      logger.stat('Duplicates removed', stats.duplicatesRemoved);
      logger.stat('Storage usage', `${stats.storageUsageGB.toFixed(2)} GB`);
      logger.stat('Duration', DateHelper.formatDuration(stats.duration));

      return stats;

    } catch (error) {
      logger.error('[SYNC] Synchronization failed:', error);
      stats.endTime = new Date();
      stats.duration = stats.endTime.getTime() - stats.startTime.getTime();
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DbStats> {
    if (!this.collection || !this.db) {
      throw new Error('Services not initialized');
    }

    try {
      const totalProblems = await this.collection.countDocuments();
      const openProblems = await this.collection.countDocuments({ status: 'OPEN' });
      const criticalProblems = await this.collection.countDocuments({ 
        severityLevel: { $in: ['CRITICAL', 'ERROR'] }
      });

      // Problems by severity
      const severityAgg = await this.collection.aggregate([
        { $group: { _id: '$severityLevel', count: { $sum: 1 } } }
      ]).toArray();

      const bySeverity: Record<string, number> = {};
      severityAgg.forEach((item: any) => {
        bySeverity[item._id] = item.count;
      });

      // Last sync
      const lastSyncDoc = await this.collection.findOne(
        {},
        { sort: { lastSyncAt: -1 }, projection: { lastSyncAt: 1 } }
      );

      // Storage stats
      const storageStats = await StorageHelper.getStorageStats(
        this.db,
        retentionConfig.activeCollection
      );

      return {
        totalProblems,
        openProblems,
        criticalProblems,
        bySeverity,
        lastSync: lastSyncDoc?.lastSyncAt || null,
        storage: {
          sizeGB: storageStats.sizeGB,
          documentCount: storageStats.documentCount,
          averageDocumentSize: storageStats.averageDocumentSize
        }
      };

    } catch (error) {
      logger.error('[SYNC] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close(): Promise<void> {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
      this.db = null;
      this.collection = null;
      logger.info('[SYNC] MongoDB connection closed');
    }
  }
}

// Singleton instance
export const dynatraceSyncService = new DynatraceSyncService();
export default dynatraceSyncService;
