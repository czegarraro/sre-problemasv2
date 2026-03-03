import { runbookService } from './runbook.service';
import { IRunbook, RunbookContext, RunbookResult } from './runbook.interface';
import logger from '../../utils/logger';

export class RemediationService {
  
  /**
   * Analyzes a problem and returns the best matching runbook ID, or null if none.
   */
  public findRemediation(problem: any): string | null {
    // Logic to map problem -> runbook
    // This could be config-driven in the future
    
    // Example Rule: High CPU -> Restart Pod
    if (problem.title?.includes('High CPU') || problem.title?.includes('Failure rate')) {
      return 'k8s-restart-pod';
    }
    
    return null;
  }

  /**
   * Simulates remediation for a problem
   */
  public async simulateRemediation(problem: any): Promise<RunbookResult | null> {
    const runbookId = this.findRemediation(problem);
    if (!runbookId) return null;

    const context: RunbookContext = {
      problemId: problem.problemId || 'unknown',
      entityId: problem.affectedEntities?.[0]?.entityId?.id || 'unknown_entity',
      entityName: problem.affectedEntities?.[0]?.name || 'unknown_svc',
      details: problem.title
    };

    return await runbookService.executeRunbook(runbookId, context);
  }
}

export const remediationService = new RemediationService();
