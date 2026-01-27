/**
 * Color utilities
 */
import { ImpactLevel, SeverityLevel, ProblemStatus } from '@/types/problem.types';

/**
 * Get severity color
 */
export const getSeverityColor = (severity: SeverityLevel): string => {
  const colors: Record<SeverityLevel, string> = {
    AVAILABILITY: '#ef4444',
    ERROR: '#f59e0b',
    PERFORMANCE: '#eab308',
    RESOURCE_CONTENTION: '#3b82f6',
    CUSTOM_ALERT: '#8b5cf6',
  };
  return colors[severity] || '#6b7280';
};

/**
 * Get impact color
 */
export const getImpactColor = (impact: ImpactLevel): string => {
  const colors: Record<ImpactLevel, string> = {
    INFRASTRUCTURE: '#6366f1',
    SERVICES: '#ec4899',
    APPLICATION: '#f97316',
    ENVIRONMENT: '#10b981',
  };
  return colors[impact] || '#6b7280';
};

/**
 * Get status color
 */
export const getStatusColor = (status: ProblemStatus): string => {
  return status === 'OPEN' ? '#ef4444' : '#10b981';
};

/**
 * Get severity badge classes
 */
export const getSeverityBadgeClass = (severity: SeverityLevel): string => {
  const classes: Record<SeverityLevel, string> = {
    AVAILABILITY: 'bg-red-500/20 text-red-400 border-red-500/30',
    ERROR: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PERFORMANCE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    RESOURCE_CONTENTION: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    CUSTOM_ALERT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return classes[severity] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Get impact badge classes
 */
export const getImpactBadgeClass = (impact: ImpactLevel): string => {
  const classes: Record<ImpactLevel, string> = {
    INFRASTRUCTURE: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    SERVICES: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    APPLICATION: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    ENVIRONMENT: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return classes[impact] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Get status badge classes
 */
export const getStatusBadgeClass = (status: ProblemStatus): string => {
  return status === 'OPEN'
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : 'bg-green-500/20 text-green-400 border-green-500/30';
};
