/**
 * Date Utilities
 */

/**
 * Calculate duration in minutes between two timestamps
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60)); // Convert to minutes
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  date: string,
  from?: string,
  to?: string
): boolean => {
  const dateTime = new Date(date).getTime();
  
  if (from && dateTime < new Date(from).getTime()) {
    return false;
  }
  
  if (to && dateTime > new Date(to).getTime()) {
    return false;
  }
  
  return true;
};

/**
 * Get date range for time series grouping
 */
export const getDateRanges = (
  problems: any[],
  granularity: 'day' | 'week' | 'month'
): string[] => {
  const dates = problems.map(p => new Date(p.startTime));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  
  const ranges: string[] = [];
  const current = new Date(minDate);
  
  while (current <= maxDate) {
    ranges.push(current.toISOString());
    
    if (granularity === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (granularity === 'week') {
      current.setDate(current.getDate() + 7);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return ranges;
};
