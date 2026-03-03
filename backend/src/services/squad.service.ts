import { SquadRepository } from '../repositories/squad.repository';
import { ProblemRepository } from '../repositories/problem.repository';
import { CreateSquadDTO } from '../types/squad.types';

export class SquadService {
  private squadRepository: SquadRepository;
  private problemRepository: ProblemRepository;

  constructor() {
    this.squadRepository = new SquadRepository();
    this.problemRepository = new ProblemRepository();
  }

  async getAllSquads() {
    return await this.squadRepository.findAll();
  }

  public async syncSquadsFromProblems(): Promise<number> {
    // 1. Obtener todos los problemas (ajustar límite en prod)
    const problems = await this.problemRepository.findAllProblems({}, 30000);

    // 2. Extraer valores únicos de tn-squad, buscando en entityTags y evidenceDetails
    const uniqueSquads = new Map<string, { count: number, _id?: string }>();

    for (const problem of problems) {
      const tags = problem.entityTags || [];
      let squadTagValue: string | undefined;

      // Buscar en los tags de nivel primario
      const primarySquadTag = tags.find((t: any) => t.key === 'tn-squad');
      if (primarySquadTag && primarySquadTag.value) {
        squadTagValue = primarySquadTag.value;
      }

      // Si no hay tag primario, buscar profundamente en evidenceDetails
      if (!squadTagValue && problem.evidenceDetails && Array.isArray(problem.evidenceDetails.details)) {
        for (const detail of problem.evidenceDetails.details) {
          if (detail.data && Array.isArray(detail.data.entityTags)) {
            const nestedSquadTag = detail.data.entityTags.find((t: any) => t.key === 'tn-squad');
            if (nestedSquadTag && nestedSquadTag.value) {
              squadTagValue = nestedSquadTag.value;
              break; // Detener la busqueda una vez encontrado
            }
          }
        }
      }

      if (squadTagValue) {
        if (!uniqueSquads.has(squadTagValue)) {
          uniqueSquads.set(squadTagValue, { count: 1 });
        } else {
          uniqueSquads.get(squadTagValue)!.count += 1;
        }
      }
    }

    // 3. Preparar DTOs para upsert
    const squadsToUpsert: CreateSquadDTO[] = Array.from(uniqueSquads.keys()).map(name => ({
      tagValue: name,
      name: name, // Por ahora el nombre es igual al valor del tag
      description: `Auto-generado desde problemas de Dynatrace. Squad: ${name}`
    }));

    // 4. Ejecutar upsert en la base de datos
    if (squadsToUpsert.length > 0) {
      await this.squadRepository.upsertMany(squadsToUpsert);
      const counts: Record<string, number> = {};
      for (const [key, val] of uniqueSquads.entries()) {
        counts[key] = val.count;
      }
      await this.squadRepository.updateProblemCounts(counts);
    }
    
    console.log(`✅ Sincronizados ${squadsToUpsert.length} squads.`);
    return squadsToUpsert.length;
  }
}
