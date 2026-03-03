/**
 * Chronic Offenders Service
 * Phase 2.5: Advanced SRE Heuristics
 * 
 * Identifies "Flapping" entities and Maintenance Window alerts
 */
import { Collection, Db } from 'mongodb';
import { falsePositiveConfig } from '../config/falsePositive.config';
import logger from '../utils/logger';

export interface ChronicOffender {
  entityId: string;
  entityName: string;
  alertCount: number;
  lastTitle: string;
  lastOccurrence: Date | string;
  isFlapping: boolean;
}

export interface MaintenanceWindowAlert {
  problemId: string;
  title: string;
  startTime: Date;
  windowReason: string;
}

export interface Phase25Summary {
  chronicOffenders: ChronicOffender[];
  maintenanceWindowAlerts: number;
  flappingEntityCount: number;
  maintenanceNoisePercent: number;
}

class ChronicOffendersService {
  private collection: Collection | null = null;

  public setCollection(db: Db): void {
    this.collection = db.collection('problems');
  }

  /**
   * Get top N recurring problem types
   * Groups by title to identify problems that happen repeatedly
   */
  public async getChronicOffenders(limit: number = 10): Promise<ChronicOffender[]> {
    if (!this.collection) {
      logger.warn('ChronicOffendersService: Collection not initialized');
      return [];
    }

    const minOccurrences = falsePositiveConfig.flapping.minOccurrences;
    logger.info(`ChronicOffenders: Starting query (minOccurrences=${minOccurrences}, limit=${limit})`);

    try {
      // Simple pipeline: group ALL data by title to find recurring problems
      const pipeline = [
        { 
          $group: {
            _id: '$title',
            alertCount: { $sum: 1 },
            lastOccurrence: { $max: '$startTime' },
            sampleEntityName: { $first: '$rootCauseEntity.name' },
            sampleEntityId: { $first: '$rootCauseEntity.entityId.id' }
          }
        },
        { $match: { alertCount: { $gt: 1 } } }, // At least 2 occurrences
        { $sort: { alertCount: -1 } },
        { $limit: limit },
        { 
          $project: {
            _id: 0,
            entityId: { $ifNull: ['$sampleEntityId', 'recurring'] },
            entityName: '$_id',
            alertCount: 1,
            lastTitle: '$_id',
            lastOccurrence: 1,
            isFlapping: { $gte: ['$alertCount', minOccurrences] }
          }
        }
      ];
      
      const results = await this.collection.aggregate(pipeline).toArray();
      logger.info(`ChronicOffenders: Found ${results.length} recurring problem types`);
      
      return results as ChronicOffender[];
    } catch (error) {
      logger.error('Error getting chronic offenders:', error);
      return [];
    }
  }

  /**
   * Check if an alert occurred during a maintenance window
   */
  public isInMaintenanceWindow(timestamp: Date | string): { isInWindow: boolean; reason: string } {
    if (!falsePositiveConfig.maintenanceWindows.enabled) {
      return { isInWindow: false, reason: '' };
    }

    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Get hours and minutes in Peru timezone
    const hours = date.getUTCHours() - 5; // Peru is UTC-5
    const adjustedHours = hours < 0 ? hours + 24 : hours;
    const timeString = `${adjustedHours.toString().padStart(2, '0')}:${date.getUTCMinutes().toString().padStart(2, '0')}`;

    for (const window of falsePositiveConfig.maintenanceWindows.windows) {
      if (timeString >= window.start && timeString <= window.end) {
        return { isInWindow: true, reason: window.reason };
      }
    }

    return { isInWindow: false, reason: '' };
  }

  /**
   * Get count of alerts that occurred during maintenance windows
   */
  public async getMaintenanceWindowAlertCount(days: number = 30): Promise<number> {
    if (!this.collection) {
      return 0;
    }

    try {
      // Instead of looking at recent 30 days from now, analyze all data
      const problems = await this.collection.find({}).project({ startTime: 1 }).limit(1000).toArray();

      // Count those in maintenance windows
      let count = 0;
      for (const problem of problems) {
        if (this.isInMaintenanceWindow(problem.startTime).isInWindow) {
          count++;
        }
      }

      return count;
    } catch (error) {
      logger.error('Error counting maintenance window alerts:', error);
      return 0;
    }
  }

  /**
   * Get Phase 2.5 Summary for Dashboard
   */
  public async getPhase25Summary(): Promise<Phase25Summary> {
    const chronicOffenders = await this.getChronicOffenders(10);
    const maintenanceWindowAlerts = await this.getMaintenanceWindowAlertCount(30);
    
    // Get total problems
    let totalProblems = 0;
    if (this.collection) {
      totalProblems = await this.collection.countDocuments({});
    }

    const maintenanceNoisePercent = totalProblems > 0 
      ? Math.round((maintenanceWindowAlerts / totalProblems) * 100 * 10) / 10
      : 0;

    return {
      chronicOffenders,
      maintenanceWindowAlerts,
      flappingEntityCount: chronicOffenders.length,
      maintenanceNoisePercent
    };
  }

  /**
   * Check if a specific entity is currently flapping
   */
  public async isEntityFlapping(entityId: string, title: string): Promise<boolean> {
    if (!this.collection) {
      return false;
    }

    const minOccurrences = falsePositiveConfig.flapping.minOccurrences;

    try {
      const count = await this.collection.countDocuments({
        'affectedEntities.entityId.id': entityId,
        title: title
      });

      return count > minOccurrences;
    } catch (error) {
      logger.error('Error checking entity flapping:', error);
      return false;
    }
  }
}

export const chronicOffendersService = new ChronicOffendersService();
export default chronicOffendersService;
