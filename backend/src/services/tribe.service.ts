import { TribeRepository } from '../repositories/tribe.repository';
import { ProblemRepository } from '../repositories/problem.repository';

export interface CreateTribeDTO {
  tagValue: string;
  name: string;
  description?: string;
  problemCount?: number;
}

export class TribeService {
  private tribeRepository: TribeRepository;
  private problemRepository: ProblemRepository;

  constructor() {
    this.tribeRepository = new TribeRepository();
    this.problemRepository = new ProblemRepository();
  }

  async getAllTribes() {
    return await this.tribeRepository.findAll();
  }

  public async syncTribesFromProblems(): Promise<number> {
    const problems = await this.problemRepository.findAllProblems({}, 30000);
    const uniqueTribes = new Map<string, { count: number, _id?: string }>();

    for (const problem of problems) {
      const tags = problem.entityTags || [];
      let tribeTagValue: string | undefined;

      const primaryTribeTag = tags.find((t: any) => t.key === 'tn-tribu');
      if (primaryTribeTag && primaryTribeTag.value) {
        tribeTagValue = primaryTribeTag.value;
      }

      if (!tribeTagValue && problem.evidenceDetails && Array.isArray(problem.evidenceDetails.details)) {
        for (const detail of problem.evidenceDetails.details) {
          if (detail.data && Array.isArray(detail.data.entityTags)) {
            const nestedTribeTag = detail.data.entityTags.find((t: any) => t.key === 'tn-tribu');
            if (nestedTribeTag && nestedTribeTag.value) {
              tribeTagValue = nestedTribeTag.value;
              break;
            }
          }
        }
      }

      if (tribeTagValue) {
        if (!uniqueTribes.has(tribeTagValue)) {
          uniqueTribes.set(tribeTagValue, { count: 1 });
        } else {
          uniqueTribes.get(tribeTagValue)!.count += 1;
        }
      }
    }

    const tribesToUpsert: CreateTribeDTO[] = Array.from(uniqueTribes.keys()).map(name => ({
      tagValue: name,
      name: name,
      description: `Auto-generado desde problemas de Dynatrace. Tribu: ${name}`
    }));

    if (tribesToUpsert.length > 0) {
      await this.tribeRepository.upsertMany(tribesToUpsert);
      const counts: Record<string, number> = {};
      for (const [key, val] of uniqueTribes.entries()) {
        counts[key] = val.count;
      }
      await this.tribeRepository.updateProblemCounts(counts);
    }
    
    console.log(`✅ Sincronizados ${tribesToUpsert.length} tribus.`);
    return tribesToUpsert.length;
  }
}
