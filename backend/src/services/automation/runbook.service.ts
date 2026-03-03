import { IRunbook, RunbookContext, RunbookResult } from './runbook.interface';
import { RestartPodRunbook } from './catalog/RestartPodRunbook';
import logger from '../../utils/logger';

class RunbookService {
  private registry: Map<string, IRunbook> = new Map();

  constructor() {
    this.registerDefaultRunbooks();
  }

  private registerDefaultRunbooks() {
    // Register catalog runbooks here
    this.register(new RestartPodRunbook());
    // this.register(new ClearCacheRunbook());
  }

  public register(runbook: IRunbook) {
    this.registry.set(runbook.id, runbook);
    logger.info(`[RunbookService] Registered runbook: ${runbook.id}`);
  }

  public getRunbook(id: string): IRunbook | undefined {
    return this.registry.get(id);
  }

  public getAllRunbooks(): IRunbook[] {
    return Array.from(this.registry.values());
  }

  public async executeRunbook(id: string, context: RunbookContext): Promise<RunbookResult> {
    const runbook = this.registry.get(id);
    if (!runbook) {
      throw new Error(`Runbook ${id} not found`);
    }

    logger.info(`[RunbookService] Executing ${id} for entity ${context.entityName}`);
    return await runbook.execute(context);
  }
}

export const runbookService = new RunbookService();
