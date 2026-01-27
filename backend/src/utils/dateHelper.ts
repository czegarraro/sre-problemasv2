/**
 * Date Helper Utilities
 * Date manipulation for ingestion and retention operations
 */

export class DateHelper {
  /**
   * Get last midnight (start of today)
   */
  static getLastMidnight(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Get next midnight (start of tomorrow)
   */
  static getNextMidnight(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /**
   * Get date N days ago
   */
  static getDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  /**
   * Get date range for last N days
   */
  static getLastNDaysRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
  }

  /**
   * Check if date is within retention period
   */
  static isWithinRetention(date: Date, retentionDays: number): boolean {
    const lastRetentionDate = this.getDaysAgo(retentionDays);
    return date > lastRetentionDate;
  }

  /**
   * Format date for logs (ISO string)
   */
  static formatForLog(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse Dynatrace timestamp (milliseconds) to Date
   */
  static parseDynatraceTimestamp(timestamp: number): Date {
    return new Date(timestamp);
  }

  /**
   * Convert Date to Dynatrace timestamp (milliseconds)
   */
  static toDynatraceTimestamp(date: Date): number {
    return date.getTime();
  }

  /**
   * Get month key for grouping (YYYY-MM format)
   */
  static getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get human readable duration
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}

export default DateHelper;
