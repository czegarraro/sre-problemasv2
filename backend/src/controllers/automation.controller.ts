import { Request, Response } from 'express';
import { runbookService } from '../services/automation/runbook.service';
import { remediationService } from '../services/automation/remediation.service';

/**
 * Automation Controller
 * Handles API requests for the Automation Dashboard
 */
export class AutomationController {

  /**
   * GET /api/v1/automation/runbooks
   * List all available runbooks
   */
  public getRunbooks = async (req: Request, res: Response) => {
    const runbooks = runbookService.getAllRunbooks();
    res.json({
      success: true,
      data: runbooks.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        type: r.type
      }))
    });
  };

  /**
   * GET /api/v1/automation/history
   * Get history of executed/simulated remediations
   * (Returns MOCK data for Phase 3 demo)
   */
  public getHistory = async (req: Request, res: Response) => {
    // MOCK HISTORY DATA
    const mockHistory = [
      {
        id: '101',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        problemId: 'P-2402123',
        runbookName: 'Restart Kubernetes Pod',
        entity: 'payment-service-pod-x82',
        status: 'SUCCESS',
        savings: 12.50,
        logs: ['[INIT] Identified faulty POD', '[K8S] Restarting...', '[SUCCESS] Resolved']
      },
      {
        id: '102',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        problemId: 'P-2402119',
        runbookName: 'Clear Temp Cache',
        entity: 'booking-service-vm',
        status: 'SUCCESS',
        savings: 8.75,
        logs: ['[INIT] Disk usage > 90%', '[CMD] Cleaning /tmp', '[SUCCESS] Released 4GB']
      },
      {
        id: '103',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        problemId: 'P-2402105',
        runbookName: 'Restart Kubernetes Pod',
        entity: 'auth-service-pod-z99',
        status: 'FAILED',
        savings: 0,
        logs: ['[INIT] Identified faulty POD', '[K8S] Connection Timed Out', '[FAIL] Aborted']
      }
    ];

    res.json({
      success: true,
      data: mockHistory
    });
  };

  /**
   * GET /api/v1/automation/stats
   * Get KPI stats for automation
   */
  public getStats = async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        totalSavings: 4250.50, // USD
        hoursSaved: 168,       // Hours
        remediationsCount: 142,
        successRate: 98.5
      }
    });
  };
}

export const automationController = new AutomationController();
