import { Problem, RootCauseAnalysis, MetricSnapshot, Change, TimelineEvent } from '../models/problem';
import logger from '../utils/logger';
import { getDatabase } from '../config/database';

export class CorrelationService {
  /**
   * Correlacionar problemas automáticamente
   */
  async correlateProblems(problem: Problem): Promise<Problem[]> {
    const db = getDatabase();
    const collection = db.collection('problems');

    // Buscar problemas correlacionados en últimas 24 horas
    const candidates = await collection
      .find({
        $and: [
          { startTime: { $gte: new Date(Date.now() - 86400000) } },
          { dynatraceId: { $ne: problem.dynatraceId } }
        ]
      })
      .toArray();

    const correlations: { problem: Problem; score: number }[] = [];

    for (const candidate of candidates) {
      const score = this.calculateCorrelationScore(problem, candidate as unknown as Problem);
      if (score > 50) {
        correlations.push({ problem: candidate as unknown as Problem, score });
      }
    }

    // Ordenar por score y retornar top 5
    return correlations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(c => c.problem);
  }

  /**
   * Realizar análisis de causa raíz automático
   */
  async performRCA(problem: Problem): Promise<RootCauseAnalysis> {
    logger.info(`[RCA] Starting root cause analysis for ${problem.dynatraceId}`);

    // 1. Analizar métricas anómalas
    const metricAnomalies = await this.detectMetricAnomalies(problem);

    // 2. Buscar cambios recientes
    const recentChanges = await this.findRecentChanges(problem);

    // 3. Correlacionar con otros eventos
    const correlatedEvents = await this.findCorrelatedEvents(problem);

    // 4. Usar ML para predecir causa raíz
    const mlPrediction = await this.mlPredictRootCause(problem, metricAnomalies, recentChanges);

    return {
      identified: true,
      hypothesis: mlPrediction.hypothesis,
      confidence: mlPrediction.confidence,
      entity: mlPrediction.entity,
      metrics: metricAnomalies.map(m => m.name),
      changes: recentChanges,
      analysis: `Based on analysis of ${metricAnomalies.length} anomalous metrics and ${recentChanges.length} recent changes. ` +
                `Correlation score: ${mlPrediction.confidence}%. ` +
                `${recentChanges.length > 0 ? 'Recent deployment detected.' : 'No recent changes found.'}`
    };
  }

  /**
   * Detectar anomalías en métricas
   */
  private async detectMetricAnomalies(problem: Problem): Promise<MetricSnapshot[]> {
    const anomalies: MetricSnapshot[] = [];

    for (const metric of problem.metrics || []) {
      if (metric.baseline) {
        const deviation = Math.abs(metric.value - metric.baseline) / metric.baseline * 100;
        if (deviation > 25) {  // 25% de desviación
          anomalies.push({
            ...metric,
            deviation
          } as MetricSnapshot & { deviation: number });
        }
      }
    }

    return anomalies.filter(a => 'deviation' in a && (a.deviation as number) > 0);
  }

  /**
   * Encontrar cambios recientes (deployments, config changes, etc)
   */
  private async findRecentChanges(problem: Problem): Promise<Change[]> {
    const db = getDatabase();
    const collection = db.collection('deployments');

    if (!problem.affectedServices || problem.affectedServices.length === 0) return [];

    const changes = await collection
      .find({
        $and: [
          { timestamp: { $gte: new Date(problem.startTime.getTime() - 600000) } },
          { timestamp: { $lte: new Date(problem.startTime.getTime() + 600000) } },
          { services: { $in: problem.affectedServices.map(s => s.id) } }
        ]
      })
      .toArray();

    return changes.map(c => ({
        timestamp: new Date(c.timestamp),
        type: 'DEPLOYMENT',
        description: `${c.service} deployed version ${c.version}`,
        impact: 'POTENTIAL_CAUSE'
    }));
  }

  /**
   * Calcular score de correlación entre dos problemas
   */
  private calculateCorrelationScore(p1: Problem, p2: Problem): number {
    let score = 0;

    // Servicios comunes
    if (p1.affectedServices && p2.affectedServices) {
        const commonServices = p1.affectedServices.filter(s1 =>
        p2.affectedServices!.some(s2 => s1.id === s2.id)
        );
        score += commonServices.length * 20;
    }

    // Misma categoría
    if (p1.category === p2.category && p1.category) score += 25;

    // Timestamp cercano (< 10 minutos)
    const timeDiff = Math.abs(p1.startTime.getTime() - p2.startTime.getTime());
    if (timeDiff < 600000) score += 20;

    // Misma severidad
    if (p1.severity === p2.severity) score += 10;

    // Métricas comunes
    const commonMetrics = p1.metrics?.filter(m1 =>
      p2.metrics?.some(m2 => m1.name === m2.name)
    ) || [];
    score += Math.min(commonMetrics.length * 5, 15);

    return Math.min(score, 100);
  }

  /**
   * Encontrar eventos correlacionados
   */
  private async findCorrelatedEvents(problem: Problem): Promise<TimelineEvent[]> {
    const db = getDatabase();
    const collection = db.collection('timelineEvents');

    const result = await collection
      .find({
        $and: [
          { timestamp: { $gte: new Date(problem.startTime.getTime() - 300000) } },
          { timestamp: { $lte: new Date((problem.endTime || new Date()).getTime()) } }
        ]
      })
      .toArray();

    return result as unknown as TimelineEvent[];
  }

  /**
   * Predicción ML de causa raíz (placeholder)
   */
  private async mlPredictRootCause(
    problem: Problem,
    anomalies: MetricSnapshot[],
    changes: Change[]
  ): Promise<{ hypothesis: string; confidence: number; entity: any }> {
    // En producción, llamaría a modelo ML entrenado
    // Por ahora, usar heurísticas

    if (changes.length > 0) {
      return {
        hypothesis: `Recent deployment likely caused the issue. ${changes[0].description}`,
        confidence: 85,
        entity: {
          id: 'deployment-123',
          name: changes[0].description,
          type: 'DEPLOYMENT'
        }
      };
    }

    if (anomalies.length > 0) {
      return {
        hypothesis: `Anomaly in ${anomalies[0].name} metric likely triggered the alert.`,
        confidence: 70,
        entity: {
          id: anomalies[0].name,
          name: anomalies[0].name,
          type: 'METRIC'
        }
      };
    }

    return {
      hypothesis: 'Unable to determine root cause from available data.',
      confidence: 30,
      entity: { id: 'unknown', name: 'Unknown', type: 'UNKNOWN' }
    };
  }
}

export default new CorrelationService();
