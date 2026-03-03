export enum RunbookType {
  KUBERNETES = 'KUBERNETES',
  DATABASE = 'DATABASE',
  VM = 'VM',
  NOTIFICATION = 'NOTIFICATION'
}

export interface RunbookContext {
  problemId: string;
  entityId: string;
  entityName: string;
  details: string;
}

export interface RunbookResult {
  success: boolean;
  logs: string[];
  actionTaken: string;
  savingsTimeMinutes: number; // Estimated time saved by automation
  savingsCurrency: number;    // Estimated money saved
}

export interface IRunbook {
  id: string;
  name: string;
  description: string;
  type: RunbookType;
  
  /**
   * Checks if this runbook applies to the given context
   */
  canHandle(context: RunbookContext): boolean;

  /**
   * Executes the remediation action
   */
  execute(context: RunbookContext): Promise<RunbookResult>;
}
