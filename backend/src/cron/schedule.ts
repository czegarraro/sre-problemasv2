/**
 * Cron Job Scheduler
 * Manages scheduled jobs for ingestion and retention
 */
import { ingestionConfig } from '../config/ingestion.config';
import { retentionConfig } from '../config/retention.config';
import logger from '../utils/logger';

// Note: Using setTimeout-based scheduling for compatibility
// For production, consider node-cron package

interface ScheduledJob {
  name: string;
  interval: number;
  handler: () => Promise<void>;
  timer: NodeJS.Timeout | null;
  lastRun: Date | null;
  running: boolean;
}

const jobs: Map<string, ScheduledJob> = new Map();

/**
 * Parse time string (HH:MM) to milliseconds until next occurrence
 */
function getMsUntilTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  
  // If time already passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target.getTime() - now.getTime();
}

/**
 * Schedule a job to run at a specific time daily
 */
function scheduleDaily(name: string, timeStr: string, handler: () => Promise<void>): void {
  const msUntil = getMsUntilTime(timeStr);
  const intervalMs = 24 * 60 * 60 * 1000; // 24 hours
  
  const job: ScheduledJob = {
    name,
    interval: intervalMs,
    handler,
    timer: null,
    lastRun: null,
    running: false
  };

  const runJob = async () => {
    if (job.running) {
      logger.warn(`[CRON] Job ${name} already running, skipping`);
      return;
    }

    job.running = true;
    logger.info(`[CRON] Executing job: ${name}`);
    
    try {
      await handler();
      job.lastRun = new Date();
      logger.success(`Job ${name} completed`);
    } catch (error: any) {
      logger.error(`[CRON] Job ${name} failed: ${error.message}`);
    } finally {
      job.running = false;
      // Schedule next run
      job.timer = setTimeout(runJob, intervalMs);
    }
  };

  // Schedule first run
  job.timer = setTimeout(runJob, msUntil);
  jobs.set(name, job);
  
  const nextRun = new Date(Date.now() + msUntil);
  logger.info(`[CRON] Scheduled ${name} - next run: ${nextRun.toISOString()}`);
}

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs(): void {
  try {
    logger.section('Initializing Cron Jobs');

    // Import jobs dynamically to avoid circular dependencies
    const { runDailyIngestionJob } = require('../jobs/dailyIngestionJob');
    const { runDataRetentionJob } = require('../jobs/dataRetentionJob');

    // Schedule daily ingestion at configured time (default: 00:00)
    scheduleDaily(
      'daily-ingestion',
      ingestionConfig.dailyRunTime,
      runDailyIngestionJob
    );

    // Schedule retention at configured time (default: 02:00)
    if (retentionConfig.autoCleanupEnabled) {
      scheduleDaily(
        'data-retention',
        ingestionConfig.retentionRunTime,
        runDataRetentionJob
      );
    }

    logger.success('All cron jobs initialized');
    logger.info(`[CRON] Ingestion scheduled at ${ingestionConfig.dailyRunTime} daily`);
    
    if (retentionConfig.autoCleanupEnabled) {
      logger.info(`[CRON] Retention scheduled at ${ingestionConfig.retentionRunTime} daily`);
    }

  } catch (error: any) {
    logger.error('[CRON] Failed to initialize cron jobs:', error.message);
    throw error;
  }
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs(): void {
  jobs.forEach((job, name) => {
    if (job.timer) {
      clearTimeout(job.timer);
      logger.info(`[CRON] Stopped job: ${name}`);
    }
  });
  jobs.clear();
}

/**
 * Get cron job status
 */
export function getCronStatus(): Array<{
  name: string;
  lastRun: Date | null;
  running: boolean;
}> {
  return Array.from(jobs.values()).map(job => ({
    name: job.name,
    lastRun: job.lastRun,
    running: job.running
  }));
}

export default { initializeCronJobs, stopCronJobs, getCronStatus };
