/**
 * False Positive Detection Service
 * Implements SRE business logic to classify problems
 * 
 * Phase 2.5: Added Flapping Detection and Maintenance Window Analysis
 */
import { falsePositiveConfig } from '../config/falsePositive.config';
import { chronicOffendersService } from './chronicOffenders.service';
import logger from '../utils/logger';

export type FPClassification = 
  | 'NOISE' 
  | 'LOW_IMPACT' 
  | 'TOLERABLE_PERF' 
  | 'VALID_INCIDENT'
  | 'FLAPPING'           // Phase 2.5: Chronic offender
  | 'MAINTENANCE_NOISE'; // Phase 2.5: During maintenance window

export interface FPAnalysisResult {
  isFalsePositive: boolean;
  score: number;
  reasons: string[];
  classification: FPClassification;
  isFlapping?: boolean;
  isMaintenanceWindow?: boolean;
  maintenanceReason?: string;
}

class FalsePositiveDetectionService {
  
  /**
   * Analyze a single problem against SRE rules
   * @param problem - The problem document from MongoDB
   * @param checkFlapping - Whether to perform async flapping check (default: false for sync analysis)
   */
  public analyzeProblem(problem: any, checkFlapping: boolean = false): FPAnalysisResult {
    let score = falsePositiveConfig.scores.baseScore;
    const reasons: string[] = [];
    let classification: FPClassification = 'VALID_INCIDENT';
    let isFlapping = false;
    let isMaintenanceWindow = false;
    let maintenanceReason = '';

    // 1. Check Exclusion Patterns (Noise)
    const titleLower = (problem.title || '').toLowerCase();
    const isExcluded = falsePositiveConfig.patterns.excludeTitles.some(pattern => 
      titleLower.includes(pattern.toLowerCase())
    );

    if (isExcluded) {
      score += falsePositiveConfig.scores.noisePatternPenalty;
      reasons.push('Matches known noise pattern');
      classification = 'NOISE';
    }

    // 2. Check Maintenance Window (Phase 2.5)
    if (problem.startTime) {
      const maintenanceCheck = chronicOffendersService.isInMaintenanceWindow(problem.startTime);
      if (maintenanceCheck.isInWindow) {
        score += falsePositiveConfig.scores.maintenanceWindowPenalty;
        reasons.push(`Occurred during maintenance window: ${maintenanceCheck.reason}`);
        isMaintenanceWindow = true;
        maintenanceReason = maintenanceCheck.reason;
        if (classification === 'VALID_INCIDENT') {
          classification = 'MAINTENANCE_NOISE';
        }
      }
    }

    // 3. Check Performance Degradation
    if (titleLower.includes('response time') || problem.severityLevel === 'PERFORMANCE') {
       // Extract ms from title using regex
       const match = titleLower.match(/increased to (\d+)[\s]*ms/);
       if (match && match[1]) {
          const currentLatency = parseInt(match[1]);
          if (currentLatency < falsePositiveConfig.thresholds.performance.toleranceMs) {
             score += falsePositiveConfig.scores.tolerablePerfPenalty;
             reasons.push(`Latency (${currentLatency}ms) within tolerance (<${falsePositiveConfig.thresholds.performance.toleranceMs}ms)`);
             if (classification === 'VALID_INCIDENT') classification = 'TOLERABLE_PERF';
          }
       } else {
         // Try to extract from evidenceDetails if available
         const latencyFromEvidence = this.extractLatencyFromEvidence(problem);
         if (latencyFromEvidence && latencyFromEvidence < falsePositiveConfig.thresholds.performance.toleranceMs) {
           score += falsePositiveConfig.scores.tolerablePerfPenalty;
           reasons.push(`Evidence latency (${latencyFromEvidence}ms) within tolerance`);
           if (classification === 'VALID_INCIDENT') classification = 'TOLERABLE_PERF';
         }
       }
    }

    // 4. Quick Recovery Check (Anti-Fragility)
    const durationMin = problem.duration; // Assuming duration in minutes
    if (durationMin > 0 && durationMin < 5) {
        score += falsePositiveConfig.scores.quickRecoveryBonus;
        reasons.push('Auto-resolved quickly (< 5 min)');
        if (classification === 'VALID_INCIDENT') classification = 'LOW_IMPACT';
    }

    // Final Decision
    // If score >= 50, it's likely a False Positive
    const isFalsePositive = score >= 50;

    return {
      isFalsePositive,
      score,
      reasons,
      classification,
      isFlapping,
      isMaintenanceWindow,
      maintenanceReason
    };
  }

  /**
   * Analyze problem with async flapping check
   * Use this for real-time analysis where we can await
   */
  public async analyzeProblemAsync(problem: any): Promise<FPAnalysisResult> {
    const result = this.analyzeProblem(problem, true);
    
    // Check flapping status
    if (problem.affectedEntities && problem.affectedEntities.length > 0 && problem.title) {
      const entityId = problem.affectedEntities[0]?.entityId?.id;
      if (entityId) {
        const isFlapping = await chronicOffendersService.isEntityFlapping(entityId, problem.title);
        if (isFlapping) {
          result.score += falsePositiveConfig.scores.repeatOffenderPenalty;
          result.reasons.push(`Entity is flapping (>${falsePositiveConfig.flapping.minOccurrences}x in ${falsePositiveConfig.flapping.windowHours}h)`);
          result.isFlapping = true;
          if (result.classification === 'VALID_INCIDENT') {
            result.classification = 'FLAPPING';
          }
          result.isFalsePositive = result.score >= 50;
        }
      }
    }
    
    return result;
  }

  /**
   * Extract latency value from evidenceDetails
   */
  private extractLatencyFromEvidence(problem: any): number | null {
    try {
      const details = problem.evidenceDetails?.details;
      if (!details || !Array.isArray(details)) return null;

      for (const evidence of details) {
        // Check for valueAfterChangePoint (in microseconds)
        if (evidence.details?.valueAfterChangePoint) {
          return Math.round(evidence.details.valueAfterChangePoint / 1000); // Convert µs to ms
        }
        // Check for properties array
        const props = evidence.data?.properties;
        if (Array.isArray(props)) {
          for (const prop of props) {
            if (prop.key?.includes('response_time') && prop.value) {
              const val = parseFloat(prop.value);
              if (!isNaN(val)) {
                return val > 1000 ? Math.round(val / 1000) : Math.round(val); // Handle µs vs ms
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Calculate Anti-Fragility Score
   * Based on system's ability to self-heal
   */
  public calculateAntiFragilityScore(problems: any[]): number {
     const total = problems.length;
     if (total === 0) return 100;

     const autoRemediated = problems.filter(p => 
        p.status === 'CLOSED' && 
        (p.duration < 15 || p.title.toLowerCase().includes('autoremediated'))
     ).length;

     return Math.round((autoRemediated / total) * 100);
  }

  /**
   * Get Phase 2.5 classification breakdown
   */
  public getClassificationBreakdown(problems: any[]): Record<FPClassification, number> {
    const breakdown: Record<FPClassification, number> = {
      'NOISE': 0,
      'LOW_IMPACT': 0,
      'TOLERABLE_PERF': 0,
      'VALID_INCIDENT': 0,
      'FLAPPING': 0,
      'MAINTENANCE_NOISE': 0
    };

    for (const problem of problems) {
      const classification = problem.classification || 'VALID_INCIDENT';
      if (classification in breakdown) {
        breakdown[classification as FPClassification]++;
      }
    }

    return breakdown;
  }
}

export const falsePositiveService = new FalsePositiveDetectionService();
export default falsePositiveService;

