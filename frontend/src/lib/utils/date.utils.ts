/**
 * Date utilities
 */
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format date to specific format
 */
export const formatDate = (date: string | Date, formatStr: string = 'PPpp'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Calculate duration in minutes
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  return differenceInMinutes(new Date(endTime), new Date(startTime));
};

/**
 * Format duration to human readable
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

/**
 * Get duration category
 */
export const getDurationCategory = (minutes: number): string => {
  if (minutes < 5) return 'less_than_5';
  if (minutes < 10) return '5_to_10';
  if (minutes < 30) return '10_to_30';
  if (minutes < 180) return '30_to_180';
  return 'more_than_180';
};
