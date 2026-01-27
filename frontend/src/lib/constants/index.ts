/**
 * Application constants
 */

export const DEMO_CREDENTIALS = {
  username: 'czegarra',
  password: 'czegarra',
};

export const PAGINATION_LIMITS = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 25;

export const IMPACT_LEVELS = [
  'INFRASTRUCTURE',
  'SERVICES',
  'APPLICATION',
  'ENVIRONMENT',
] as const;

export const SEVERITY_LEVELS = [
  'AVAILABILITY',
  'ERROR',
  'PERFORMANCE',
  'RESOURCE_CONTENTION',
  'CUSTOM_ALERT',
] as const;

export const PROBLEM_STATUSES = ['OPEN', 'CLOSED'] as const;

export const EVIDENCE_TYPES = [
  'EVENT',
  'METRIC',
  'TRANSACTIONAL',
  'MAINTENANCE_WINDOW',
] as const;

export const DURATION_CATEGORIES = [
  { label: '< 5 min', value: 'less_than_5' },
  { label: '5-10 min', value: '5_to_10' },
  { label: '10-30 min', value: '10_to_30' },
  { label: '30 min - 3 hrs', value: '30_to_180' },
  { label: '> 3 hrs', value: 'more_than_180' },
] as const;

export const TIME_GRANULARITIES = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
] as const;
