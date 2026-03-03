/**
 * False Positive Analysis Configuration
 * Centralized settings for SRE Business Logic
 */

export const falsePositiveConfig = {
  // 1. Exclusion Patterns (Regex compatible strings)
  // Problems matching these titles are automatically marked as False Positive (Noise)
  patterns: {
    excludeTitles: [
      'no deployment pods', 
      'deployment event', 
      'pod eviction', 
      'synthetic monitor failed', // Often transient
      'host unavailable'         // If handled by redundancy
    ],
  },

  // 2. Thresholds for "Real Impact"
  thresholds: {
    impact: {
      // If affected users < X%, consider it Low Impact (Potential FP)
      ignoredPercentage: 30, 
    },
    performance: {
      // Base SLA response time (ms)
      baselineMs: 200, 
      // If degradation is below this absolute value (ms), it's considered tolerable
      toleranceMs: 1000, // Updated from 500 to 1000 based on validation
    }
  },

  // 3. Flapping Detection (Chronic Offenders)
  flapping: {
    windowHours: 24,           // Rolling window to check for repeated alerts
    minOccurrences: 3,         // Threshold: >3 alerts = chronic offender
    penaltyScore: 15,          // Score to add if entity is flapping
  },

  // 4. Maintenance Windows (Time-of-Day Analysis)
  maintenanceWindows: {
    enabled: true,
    windows: [
      { start: '02:00', end: '05:00', reason: 'Nightly Batch Jobs', timezone: 'America/Lima' },
    ],
    penaltyScore: 25,          // Score to add if alert during maintenance
  },

  // 5. Scoring System (0-100)
  // Higher score = Higher probability of being a False Positive
  scores: {
    baseScore: 0,
    lowImpactPenalty: 40,      // +40 if impact < 30%
    noisePatternPenalty: 100,  // +100 if matches noise title
    tolerablePerfPenalty: 30,  // +30 if latency degraded but < toleranceMs
    quickRecoveryBonus: 20,    // +20 if resolved < 5 mins
    repeatOffenderPenalty: 15, // +15 if problem repeats > 3 times/24h (flapping)
    maintenanceWindowPenalty: 25, // +25 if occurred during maintenance window
  }
};

export default falsePositiveConfig;

