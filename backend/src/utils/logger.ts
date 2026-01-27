/**
 * Logger Utility
 * Structured logging for ingestion system
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLogLevel: LogLevel = (process.env.INGESTION_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', message), ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message), ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message), ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message), ...args);
    }
  },

  /**
   * Log a section header
   */
  section: (title: string) => {
    if (shouldLog('info')) {
      console.log('');
      console.log('========================================');
      console.log(` ${title}`);
      console.log('========================================');
    }
  },

  /**
   * Log success message
   */
  success: (message: string) => {
    if (shouldLog('info')) {
      console.log(`✅ ${message}`);
    }
  },

  /**
   * Log failure message
   */
  failure: (message: string) => {
    if (shouldLog('error')) {
      console.error(`❌ ${message}`);
    }
  },

  /**
   * Log a stat line
   */
  stat: (label: string, value: string | number) => {
    if (shouldLog('info')) {
      console.log(`  - ${label}: ${value}`);
    }
  }
};

export default logger;
