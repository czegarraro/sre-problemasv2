/**
 * Storage Helper Utilities
 * MongoDB storage management for ingestion system
 */
import { Db, Collection } from 'mongodb';

export interface StorageStats {
  sizeBytes: number;
  sizeGB: number;
  documentCount: number;
  averageDocumentSize: number;
}

export interface StorageLimitCheck {
  reached: boolean;
  warning: boolean;
  usage: number;
  sizeGB: number;
}

export class StorageHelper {
  /**
   * Get storage statistics for a collection
   */
  static async getStorageStats(db: Db, collectionName: string): Promise<StorageStats> {
    try {
      const stats = await db.command({ collStats: collectionName });
      
      return {
        sizeBytes: stats.size || 0,
        sizeGB: (stats.size || 0) / (1024 * 1024 * 1024),
        documentCount: stats.count || 0,
        averageDocumentSize: stats.avgObjSize || 0
      };
    } catch (error) {
      console.error('[STORAGE] Error getting stats:', error);
      // Return zeros if collection doesn't exist yet
      return {
        sizeBytes: 0,
        sizeGB: 0,
        documentCount: 0,
        averageDocumentSize: 0
      };
    }
  }

  /**
   * Check if storage limit is reached
   */
  static async isStorageLimitReached(
    db: Db,
    collectionName: string,
    limitGB: number,
    warningThresholdPercent: number = 80
  ): Promise<StorageLimitCheck> {
    const stats = await this.getStorageStats(db, collectionName);
    const usagePercent = limitGB > 0 ? (stats.sizeGB / limitGB) * 100 : 0;

    return {
      reached: stats.sizeGB >= limitGB,
      warning: usagePercent >= warningThresholdPercent,
      usage: usagePercent,
      sizeGB: stats.sizeGB
    };
  }

  /**
   * Estimate how many documents fit in X GB
   */
  static estimateDocumentsForSize(
    avgDocumentSize: number,
    targetSizeGB: number
  ): number {
    if (avgDocumentSize <= 0) return 0;
    const targetBytes = targetSizeGB * 1024 * 1024 * 1024;
    return Math.floor(targetBytes / avgDocumentSize);
  }

  /**
   * Remove duplicate documents by unique field
   */
  static async removeDuplicates(
    collection: Collection,
    uniqueField: string = 'dynatraceId'
  ): Promise<number> {
    try {
      console.log('[STORAGE] Scanning for duplicates...');

      // Find duplicates using aggregation
      const duplicates = await collection.aggregate([
        {
          $group: {
            _id: `$${uniqueField}`,
            count: { $sum: 1 },
            ids: { $push: '$_id' }
          }
        },
        {
          $match: { count: { $gt: 1 } }
        }
      ]).toArray();

      if (duplicates.length === 0) {
        console.log('[STORAGE] No duplicates found');
        return 0;
      }

      let deletedCount = 0;

      for (const dup of duplicates) {
        // Keep the first, delete the rest
        const idsToDelete = dup.ids.slice(1);
        const result = await collection.deleteMany({
          _id: { $in: idsToDelete }
        });
        deletedCount += result.deletedCount;
      }

      console.log(`[STORAGE] Removed ${deletedCount} duplicate documents`);
      return deletedCount;

    } catch (error) {
      console.error('[STORAGE] Error removing duplicates:', error);
      throw error;
    }
  }

  /**
   * Get index size for a collection
   */
  static async getIndexSize(db: Db, collectionName: string): Promise<number> {
    try {
      const stats = await db.command({ collStats: collectionName });
      return stats.totalIndexSize || 0;
    } catch (error) {
      console.error('[STORAGE] Error getting index size:', error);
      return 0;
    }
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default StorageHelper;
