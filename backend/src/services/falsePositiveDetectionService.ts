import { Problem, FalsePositivePattern } from '../models/problem';
import logger from '../utils/logger';
import { getDatabase } from '../config/database';

export class FalsePositiveDetectionService {
  /**
   * Analiza un problema para detectar si es falso positivo
   * Usa ML features para detección
   */
  async analyzeProblem(problem: Problem): Promise<{
    isFalsePositive: boolean;
    score: number;
    reasons: string[];
    patterns: string[];
    recommendation: string;
  }> {
    logger.info(`[FP-DETECTION] Analyzing problem: ${problem.dynatraceId}`);

    const reasons: string[] = [];
    const patterns: string[] = [];
    let score = 0;

    // ==================== HEURÍSTICAS ====================

    // 1. Duración muy corta (<1 minuto)
    // Usando 60000ms = 1 minuto. problem.duration a veces viene en minutos en el transform, hay que validar.
    // Asumiendo que Duration en el objeto Problem SRE es en ms, pero el legado lo guarda en minutos.
    // Vamos a normalizar: Si es < 1 (asumiendo minutos) o < 60000 (ms)
    // El transformador actual guarda duration en minutos.
    const durationMs = problem.duration < 1000 ? problem.duration * 60000 : problem.duration; 

    if (durationMs < 60000) {
      score += 15;
      reasons.push('Duration very short (< 1 minute)');
      patterns.push('SHORT_DURATION');
    }

    // 2. Sin usuarios afectados
    if (problem.impact && problem.impact.affectedUsers === 0) {
      score += 20;
      reasons.push('No affected users');
      patterns.push('NO_USER_IMPACT');
    } else if (!problem.impact && (!problem.totalAffectedUsers || problem.totalAffectedUsers === 0)) {
       // fallback si impact object no existe
       score += 20; // Asumimos si no hay info
       reasons.push('No affected users info (assumed 0)');
       patterns.push('NO_USER_IMPACT');
    }

    // 3. Error rate muy bajo (<0.1%)
    if (problem.impact && problem.impact.errorRate < 0.1) {
      score += 15;
      reasons.push('Error rate too low (< 0.1%)');
      patterns.push('LOW_ERROR_RATE');
    }

    // 4. Latencia dentro de SLO
    if (problem.impact && problem.impact.latencyIncrease < 100) {
      score += 10;
      reasons.push('Latency increase minimal');
      patterns.push('MINIMAL_LATENCY');
    }

    // 5. Sin cambios recientes detectados
    if (!problem.rootCause?.changes || problem.rootCause.changes.length === 0) {
        // Solo penalizar si tenemos capacidad de detectar cambios
        // score += 10; 
        // reasons.push('No recent changes correlated');
        // patterns.push('NO_CHANGES');
    }

    // 6. Patrón conocido de falso positivo
    const knownPatterns = await this.getKnownFalsePositivePatterns(problem);
    if (knownPatterns.length > 0) {
      score += 25;
      reasons.push(`Matches ${knownPatterns.length} known false positive pattern(s)`);
      patterns.push(...knownPatterns);
    }

    // 7. Métrica anómala es ruido conocido
    if (this.isMetricNoise(problem)) {
      score += 20;
      reasons.push('Metric noise detected');
      patterns.push('METRIC_NOISE');
    }

    // 8. Timestamp durante mantenimiento
    if (await this.isDuringMaintenance(problem)) {
      score += 30;
      reasons.push('Problem detected during scheduled maintenance window');
      patterns.push('MAINTENANCE_WINDOW');
    }

    // ==================== ML FEATURES ====================

    // Usar ML model si está disponible
    const mlScore = await this.mlPredict(problem);
    if (mlScore > 0) {
      score = Math.max(score, mlScore);
      reasons.push(`ML model confidence: ${mlScore}%`);
    }

    // ==================== CORRELACIÓN ====================

    // Si correlaciona con otros falsos positivos
    const correlatedFP = await this.findCorrelatedFalsePositives(problem);
    if (correlatedFP.length > 0) {
      score += 15;
      reasons.push(`Correlates with ${correlatedFP.length} other false positives`);
    }

    const isFalsePositive = score >= 70;

    return {
      isFalsePositive,
      score: Math.min(100, score),
      reasons,
      patterns,
      recommendation: this.getRecommendation(isFalsePositive, score, patterns)
    };
  }

  /**
   * Obtener patrones conocidos de falsos positivos
   */
  private async getKnownFalsePositivePatterns(problem: Problem): Promise<string[]> {
    try {
        const db = getDatabase();
        const collection = db.collection('falsePositivePatterns');

        // Check if collection exists implicitly by handling empty array return
        
        const patterns = await collection.aggregate([
            {
            $match: {
                shouldAutoSuppress: true,
                confidence: { $gte: 80 }
            }
            },
            {
            $addFields: {
                score: {
                $cond: [
                    { $eq: ['$pattern', problem.title] },
                    100,
                    {
                    $cond: [
                        { $eq: ['$pattern', problem.category] },
                        70,
                        0
                    ]
                    }
                ]
                }
            }
            },
            {
            $match: { score: { $gte: 50 } }
            },
            { $limit: 5 }
        ]).toArray();

        // @ts-ignore
        return patterns.map(p => p.pattern);
    } catch (e) {
        return [];
    }
  }

  /**
   * Detectar ruido de métrica
   */
  private isMetricNoise(problem: Problem): boolean {
    const durationMs = problem.duration < 1000 ? problem.duration * 60000 : problem.duration; 

    if (durationMs < 10000) return true;

    const metrics = problem.metrics || [];
    if (metrics.length === 0) return false;

    const stdDev = this.calculateStdDev(metrics.map(m => m.value));

    // Si desviación es muy pequeña relativa a baseline
    if (stdDev < 1) return true;

    return false;
  }

  /**
   * Verificar si está durante mantenimiento
   */
  private async isDuringMaintenance(problem: Problem): Promise<boolean> {
    const db = getDatabase();
    const collection = db.collection('maintenanceWindows');

    const maintenance = await collection.findOne({
      $and: [
        { startTime: { $lte: problem.startTime } },
        { endTime: { $gte: problem.startTime } }
      ]
    });

    return !!maintenance;
  }

  /**
   * Predicción ML (placeholder para modelo real)
   */
  private async mlPredict(problem: Problem): Promise<number> {
    // Aquí iría llamada a modelo ML real
    // Por ahora, usar heurísticas simples
    return 0;
  }

  /**
   * Encontrar falsos positivos correlacionados
   */
  private async findCorrelatedFalsePositives(problem: Problem): Promise<string[]> {
    const db = getDatabase();
    const collection = db.collection('problems');

    const startWindow = new Date(problem.startTime.getTime() - 300000);
    const endWindow = new Date(problem.startTime.getTime() + 300000);

    const correlated = await collection
      .find({
        $and: [
          { isFalsePositive: true },
          { startTime: { $gte: startWindow } },
          { startTime: { $lte: endWindow } },
          { dynatraceId: { $ne: problem.dynatraceId } },
          // { category: problem.category } // Category might be undefined in legacy data
        ]
      })
      .limit(10)
      .toArray();

    // @ts-ignore
    return correlated.map(c => c.dynatraceId);
  }

  /**
   * Calcular desviación estándar
   */
  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2)) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Obtener recomendación
   */
  private getRecommendation(isFalsePositive: boolean, score: number, patterns: string[]): string {
    if (!isFalsePositive) {
      return 'Investigate immediately. Escalate to on-call engineer.';
    }

    if (patterns.includes('MAINTENANCE_WINDOW')) {
      return 'Suppress alert. Detected during maintenance window.';
    }

    if (patterns.includes('METRIC_NOISE')) {
      return 'Adjust alerting threshold. Metric shows expected variance.';
    }

    if (patterns.includes('NO_USER_IMPACT')) {
      return 'Lower priority. No user impact detected. Monitor for escalation.';
    }

    return 'Likely false positive. Review and suppress if confirmed.';
  }
}

export default new FalsePositiveDetectionService();
