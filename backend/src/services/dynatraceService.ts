/**
 * Dynatrace API Service
 * Client for interacting with Dynatrace Problems API
 */
import { 
  validateDynatraceConfig, 
  getProblemsApiUrl, 
  getAuthHeader 
} from '../config/dynatrace.config';
import { ingestionConfig } from '../config/ingestion.config';
import { DateHelper } from '../utils/dateHelper';
import logger from '../utils/logger';

// Problem from Dynatrace API
interface DynatraceProblem {
  problemId: string;
  displayId: string;
  title: string;
  status: string;
  severityLevel: string;
  impactLevel: string;
  startTime: number;
  endTime: number;
  affectedEntities: Array<{
    entityId: { id: string; type: string };
    name: string;
  }>;
  managementZones: Array<{
    id: string;
    name: string;
  }>;
  rootCauseEntity?: {
    entityId: { id: string; type: string };
    name: string;
  };
  evidenceDetails?: {
    totalCount: number;
    details: Array<{
      evidenceType: string;
      displayName: string;
    }>;
  };
}

// Enriched problem with details
interface EnrichedProblem extends DynatraceProblem {
  recentComments?: {
    comments: Array<{
      content: string;
      createdAtTimestamp: number;
    }>;
  };
}

// Transformed problem for MongoDB
export interface TransformedProblem {
  dynatraceId: string;
  displayId: string;
  title: string;
  status: string;
  severityLevel: string;
  impactLevel: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  affectedEntities: Array<{
    entityId: { id: string; type: string };
    name: string;
  }>;
  managementZones: Array<{
    id: string;
    name: string;
  }>;
  rootCauseEntity?: {
    entityId: { id: string; type: string };
    name: string;
  };
  evidenceDetails?: {
    totalCount: number;
    details: Array<{
      evidenceType: string;
      displayName: string;
    }>;
  };
  recentComments?: {
    comments: Array<{
      content: string;
      createdAtTimestamp: number;
    }>;
  };
  lastSyncAt: Date;
  syncStatus: string;
  syncCount: number;
}

class DynatraceService {
  private headers: Record<string, string>;

  constructor() {
    this.headers = {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    };
  }

  /**
   * Test connection to Dynatrace API
   */
  async testConnection(): Promise<boolean> {
    try {
      logger.info('[DYNATRACE] Testing connection...');
      
      const validation = validateDynatraceConfig();
      if (!validation.valid) {
        validation.errors.forEach(err => logger.error(`[DYNATRACE] ${err}`));
        return false;
      }

      const url = `${getProblemsApiUrl()}?pageSize=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[DYNATRACE] Connection failed: ${response.status} - ${errorText}`);
        return false;
      }

      logger.success('Dynatrace connection successful');
      return true;

    } catch (error) {
      logger.error('[DYNATRACE] Connection error:', error);
      return false;
    }
  }

  /**
   * Fetch problems list from Dynatrace
   */
  async fetchProblems(options?: {
    from?: Date;
    to?: Date;
    status?: 'OPEN' | 'CLOSED';
    pageSize?: number;
  }): Promise<DynatraceProblem[]> {
    try {
      const { status, pageSize = 500 } = options || {};

      // Default to last 90 days
      const dateRange = options?.from && options?.to
        ? { start: options.from, end: options.to }
        : DateHelper.getLastNDaysRange(ingestionConfig.retentionDays);

      logger.info(`[DYNATRACE] Fetching total problems from ${DateHelper.formatForLog(dateRange.start)} to ${DateHelper.formatForLog(dateRange.end)}`);

      const allProblems: DynatraceProblem[] = [];
      const chunkDays = 7; // 7-day chunks to avoid 10,000 Dynatrace limit
      let currentEnd = dateRange.end;
      
      while (currentEnd > dateRange.start) {
        let currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() - chunkDays);
        if (currentStart < dateRange.start) {
          currentStart = dateRange.start;
        }

        const fromTs = DateHelper.toDynatraceTimestamp(currentStart);
        const toTs = DateHelper.toDynatraceTimestamp(currentEnd);

        let url = `${getProblemsApiUrl()}?from=${fromTs}&to=${toTs}&pageSize=${pageSize}`;
        if (status) {
           url += `&status=${status}`;
        }

        logger.info(`[DYNATRACE] Fetching chunk: ${DateHelper.formatForLog(currentStart)} to ${DateHelper.formatForLog(currentEnd)}`);

        let nextPageKey: string | null = null;
        let pageCount = 0;

        do {
          const pageUrl = nextPageKey
            ? `${getProblemsApiUrl()}?nextPageKey=${encodeURIComponent(nextPageKey)}`
            : url;

          const response = await fetch(pageUrl, {
            method: 'GET',
            headers: this.headers
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error ${response.status}: ${errorText}`);
          }

          const data = await response.json() as { problems?: DynatraceProblem[]; nextPageKey?: string };
          const problems: DynatraceProblem[] = data.problems || [];
          allProblems.push(...problems);

          nextPageKey = data.nextPageKey || null;
          pageCount++;

          if (pageCount >= 500) {
            logger.warn('[DYNATRACE] Reached chunk page limit (500), stopping pagination for this chunk');
            break;
          }

        } while (nextPageKey);
        
        // Stop fetching extra chunks if we already hit 30,000 threshold to prevent endless memory loops in local/test memory
        if (allProblems.length >= 30000) {
            logger.warn(`[DYNATRACE] Reached maximum requested ingest volume of 30,000. Stopping chunks early.`);
            break;
        }

        // Move the window backwards
        currentEnd = currentStart;
      }

      logger.info(`[DYNATRACE] Total problems fetched across all chunks: ${allProblems.length}`);
      return allProblems.slice(0, 30000); // Enforce max array size

    } catch (error) {
      logger.error('[DYNATRACE] Error fetching problems:', error);
      throw error;
    }
  }

  /**
   * Fetch detailed problem info
   */
  async fetchProblemDetails(problemId: string): Promise<EnrichedProblem | null> {
    try {
      const url = `${getProblemsApiUrl()}/${problemId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          logger.warn(`[DYNATRACE] Problem ${problemId} not found`);
          return null;
        }
        throw new Error(`API error ${response.status}`);
      }

      return await response.json() as EnrichedProblem;

    } catch (error) {
      logger.error(`[DYNATRACE] Error fetching problem ${problemId}:`, error);
      return null;
    }
  }

  /**
   * Enrich problems with detailed information
   */
  async enrichProblemsWithDetails(
    problems: DynatraceProblem[],
    concurrency: number = 5
  ): Promise<EnrichedProblem[]> {
    const enriched: EnrichedProblem[] = [];
    const total = problems.length;
    
    logger.info(`[DYNATRACE] Enriching ${total} problems (concurrency: ${concurrency})`);

    // Process in batches
    for (let i = 0; i < total; i += concurrency) {
      const batch = problems.slice(i, i + concurrency);
      
      const results = await Promise.all(
        batch.map(async (problem) => {
          const details = await this.fetchProblemDetails(problem.problemId);
          return details || problem as EnrichedProblem;
        })
      );
      
      enriched.push(...results);
      
      // Progress log every 50 problems
      if ((i + concurrency) % 50 === 0 || i + concurrency >= total) {
        logger.debug(`[DYNATRACE] Enriched ${Math.min(i + concurrency, total)}/${total} problems`);
      }

      // Small delay to avoid rate limiting
      if (i + concurrency < total) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return enriched;
  }

  /**
   * Transform Dynatrace problem to MongoDB format
   */
  transformProblem(problem: EnrichedProblem): TransformedProblem {
    const startTime = DateHelper.parseDynatraceTimestamp(problem.startTime);
    const endTime = problem.endTime > 0 
      ? DateHelper.parseDynatraceTimestamp(problem.endTime) 
      : null;
    
    const duration = endTime 
      ? (endTime.getTime() - startTime.getTime()) / 1000 / 60 // in minutes
      : (Date.now() - startTime.getTime()) / 1000 / 60;

    return {
      dynatraceId: problem.problemId,
      displayId: problem.displayId,
      title: problem.title,
      status: problem.status,
      severityLevel: problem.severityLevel,
      impactLevel: problem.impactLevel,
      startTime,
      endTime,
      duration: Math.round(duration),
      affectedEntities: problem.affectedEntities || [],
      managementZones: problem.managementZones || [],
      rootCauseEntity: problem.rootCauseEntity,
      evidenceDetails: problem.evidenceDetails,
      recentComments: problem.recentComments,
      lastSyncAt: new Date(),
      syncStatus: 'SYNCED',
      syncCount: 1
    };
  }
}

// Singleton instance
export const dynatraceService = new DynatraceService();
export default dynatraceService;
