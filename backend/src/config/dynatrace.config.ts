/**
 * Dynatrace API Configuration
 * Settings for connecting to Dynatrace Problems API
 */
import dotenv from 'dotenv';

dotenv.config();

export interface DynatraceConfig {
  // Environment
  environmentUrl: string;
  apiToken: string;
  
  // API settings
  apiVersion: string;
  problemsEndpoint: string;
  
  // Request settings
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const dynatraceConfig: DynatraceConfig = {
  // Environment URL (remove trailing slash)
  environmentUrl: (process.env.DT_ENVIRONMENT_URL || process.env.DYNATRACE_ENVIRONMENT_URL || '')
    .replace(/\/$/, ''),
  apiToken: process.env.DT_API_TOKEN || process.env.DYNATRACE_API_TOKEN || '',
  
  // API settings
  apiVersion: 'v2',
  problemsEndpoint: '/api/v2/problems',
  
  // Request settings
  timeout: parseInt(process.env.DT_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.DT_MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.DT_RETRY_DELAY || '1000')
};

/**
 * Validate Dynatrace configuration
 */
export function validateDynatraceConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!dynatraceConfig.environmentUrl) {
    errors.push('DT_ENVIRONMENT_URL or DYNATRACE_ENVIRONMENT_URL is required');
  }
  
  if (!dynatraceConfig.apiToken) {
    errors.push('DT_API_TOKEN or DYNATRACE_API_TOKEN is required');
  }
  
  if (dynatraceConfig.apiToken && !dynatraceConfig.apiToken.startsWith('dt0c01.')) {
    errors.push('API token should start with "dt0c01." - please verify the token format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get full API URL for problems endpoint
 */
export function getProblemsApiUrl(): string {
  return `${dynatraceConfig.environmentUrl}${dynatraceConfig.problemsEndpoint}`;
}

/**
 * Get authorization header
 */
export function getAuthHeader(): { Authorization: string } {
  return {
    Authorization: `Api-Token ${dynatraceConfig.apiToken}`
  };
}

export default dynatraceConfig;
