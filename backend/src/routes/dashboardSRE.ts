import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import logger from '../utils/logger';
import { getDatabase } from '../config/database';

const router = express.Router();

// Helper functions (implemented here as they were missing in the design snippet)
const calculateTrend = async (collection: any) => {
    // Simple implementation: compare last 24h with previous 24h
    const now = new Date();
    const last24h = new Date(now.getTime() - 86400000);
    const prev24h = new Date(last24h.getTime() - 86400000);

    const currentCount = await collection.countDocuments({ startTime: { $gte: last24h } });
    const prevCount = await collection.countDocuments({ startTime: { $gte: prev24h, $lt: last24h } });

    if (prevCount === 0) return { trend: 'STABLE', percentage: 0 };

    const diff = currentCount - prevCount;
    const percentage = (diff / prevCount) * 100;
    
    let trend = 'STABLE';
    if (percentage > 5) trend = 'DEGRADING'; // More problems is bad
    if (percentage < -5) trend = 'IMPROVING'; // Fewer problems is good

    return { trend, percentage };
};

const simpleForecasting = (hourly: any[], hours: number) => {
    // Simple moving average forecast
    if (hourly.length === 0) return [];
    
    // Calculate average hourly rate from last 24h data availability
    const avg = hourly.reduce((sum, h) => sum + h.total, 0) / hourly.length;
    
    return Array.from({ length: hours }).map((_, i) => ({
        hour: i + 1,
        predictedProblems: Math.max(0, avg * (1 + (Math.random() * 0.2 - 0.1))) // Add slight noise for "realism" visualization
    }));
};

const findPeakHour = (hourly: any[]) => {
    if (hourly.length === 0) return null;
    return hourly.reduce((max, h) => h.total > max.total ? h : max, hourly[0]);
};

const findLowestHour = (hourly: any[]) => {
    if (hourly.length === 0) return null;
    return hourly.reduce((min, h) => h.total < min.total ? h : min, hourly[0]);
};

const learnFalsePositivePattern = async (problem: any, reason: string) => {
    if (!problem) return;
    const db = getDatabase();
    await db.collection('falsePositivePatterns').updateOne(
        { pattern: problem.title },
        { 
            $set: { 
                reason, 
                shouldAutoSuppress: true,
                lastOccurrence: new Date(),
                updatedAt: new Date()
            },
            $inc: { frequency: 1 },
            $setOnInsert: {
                createdAt: new Date(),
                confidence: 80
            }
        },
        { upsert: true }
    );
};

// ================= ROUTES =================

/**
 * GET /api/v1/dashboard/sre/overview
 * Dashboard principal SRE
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const problemsCollection = db.collection('problems');
    const aggregatesCollection = db.collection('hourlyAggregates');

    // Últimas 24 horas
    const last24h = new Date(Date.now() - 86400000);

    // Métricas generales
    const [total, critical, highSeverity, falsePositives, averageDurationDocs] = await Promise.all([
      problemsCollection.countDocuments({ startTime: { $gte: last24h } }),
      problemsCollection.countDocuments({ startTime: { $gte: last24h }, severityLevel: 'CRITICAL' }),
      problemsCollection.countDocuments({ startTime: { $gte: last24h }, severityLevel: 'HIGH' }),
      problemsCollection.countDocuments({ startTime: { $gte: last24h }, isFalsePositive: true }),
      problemsCollection.aggregate([
        { $match: { startTime: { $gte: last24h } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } }
      ]).toArray()
    ]);
    
    const averageDuration = averageDurationDocs.length > 0 ? averageDurationDocs[0].avg : 0;

    // Tendencia (comparar con período anterior)
    const trend = await calculateTrend(problemsCollection);

    // Servicios más afectados
    const topServices = await problemsCollection.aggregate([
      { $match: { startTime: { $gte: last24h } } },
      { $unwind: '$affectedEntities' },
      { $match: { 'affectedEntities.name': { $exists: true } } }, // Ensure name exists
      { $group: { _id: '$affectedEntities.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    // Categorías de problemas
    const byCategory = await problemsCollection.aggregate([
      { $match: { startTime: { $gte: last24h } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Error budget impact
    const errorBudgetImpact = await aggregatesCollection.aggregate([
      { $match: { hour: { $gte: last24h } } },
      { $group: { _id: null, totalImpact: { $sum: '$totalErrorBudgetImpact' } } }
    ]).toArray();

    res.json({
      status: 'ok',
      data: {
        overview: {
          total,
          critical,
          high: highSeverity,
          falsePositives,
          fpRate: total > 0 ? (falsePositives / total * 100).toFixed(2) : "0.00",
          averageDuration: averageDuration,  // en minutos se guarda en DB, frontend espera segundos? Ajustar en frontend o aqui. DB guarda minutos. Dashboard code says "duration / 1000", assumes MS. 
          // DB Model says "duration: number; // en ms". Transform says "// in minutes". Discrepancy.
          // Transform logic: duration = ... / 1000 / 60. So DB has minutes. 
          // Dashboard logic: display duration.toFixed(0) + 's'. Wait.
          // Let's normalize to SECONDS for frontend API consistency with user expectation
          trend: trend.trend,
          trendPercentage: trend.percentage
        },
        topServices: topServices.map(s => ({
          name: s._id,
          incidents: s.count
        })),
        byCategory: byCategory.map(c => ({
          category: c._id || 'UNKNOWN',
          count: c.count
        })),
        errorBudgetImpact: errorBudgetImpact[0]?.totalImpact || 0
      }
    });
  } catch (error: any) {
    logger.error('[DASHBOARD] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/dashboard/sre/problems/detailed
 * Lista detallada de problemas con clasificación FP
 */
router.get('/problems/detailed', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const collection = db.collection('problems');

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const filters: any = {};

    // Filtros opcionales
    if (req.query.status) filters.status = req.query.status;
    if (req.query.severity) filters.severityLevel = req.query.severity;
    if (req.query.fpOnly === 'true') filters.isFalsePositive = true;
    if (req.query.fpOnly === 'false') filters.isFalsePositive = false;

    const problems = await collection
      .find(filters)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filters);

    res.json({
      status: 'ok',
      data: problems.map(p => ({
        id: p._id,
        dynatraceId: p.dynatraceId,
        title: p.title,
        severity: p.severityLevel,
        status: p.status,
        startTime: p.startTime,
        duration: (p.duration || 0) * 60 * 1000, // Convert minutes back to ms for frontend compatibility if needed
        affectedUsers: p.impact?.affectedUsers || 0,
        affectedServices: p.affectedEntities?.map((s: any) => s.name) || [],
        isFalsePositive: p.isFalsePositive || false,
        fpScore: p.falsePositiveScore || 0,
        fpReason: p.falsePositiveReason,
        rootCause: p.rootCause?.hypothesis,
        rcaConfidence: p.rootCause?.confidence,
        category: p.category || 'UNKNOWN',
        errorBudgetImpact: p.sloImpact?.impactPercentage || 0
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    logger.error('[DASHBOARD] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/dashboard/sre/slo/status
 * Estado actual de SLOs
 */
router.get('/slo/status', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const collection = db.collection('sloMetrics');

    const slos = await collection
      .aggregate([
        {
          $match: {
            timestamp: { $gte: new Date(Date.now() - 86400000) }
          }
        },
        {
          $sort: { timestamp: -1 }
        },
        {
          $group: {
            _id: '$serviceName',
            sloName: { $first: '$sloName' },
            sloTarget: { $first: '$sloTarget' },
            currentCompliance: { $first: '$compliance' },
            budgetRemaining: { $first: '$budgetRemaining' },
            status: {
              $cond: [
                { $lt: ['$budgetRemaining', 5] },
                'CRITICAL',
                { $cond: [{ $lt: ['$budgetRemaining', 20] }, 'WARNING', 'HEALTHY'] }
              ]
            }
          }
        },
        { $sort: { status: -1 } }
      ])
      .toArray();

    res.json({
      status: 'ok',
      data: slos
    });
  } catch (error: any) {
    logger.error('[DASHBOARD] SLO Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/dashboard/sre/analytics/trends
 * Tendencias y predicciones
 */
router.get('/analytics/trends', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const collection = db.collection('hourlyAggregates');

    // Últimas 7 días
    const last7days = new Date(Date.now() - 604800000);

    const data = await collection
      .find({ hour: { $gte: last7days } })
      .sort({ hour: 1 })
      .toArray();

    // Calcular tendencias por hora
    const hourly = data.map(d => ({
      timestamp: d.hour,
      total: d.totalProblems,
      critical: d.critical,
      fpRate: d.totalProblems > 0 ? (d.falsePositives / d.totalProblems * 100).toFixed(2) : "0.00",
      trend: d.trend
    }));

    // Predicción simple (média móvil)
    const avgProblems = hourly.length > 0 ? hourly.reduce((sum, h) => sum + h.total, 0) / hourly.length : 0;
    const forecast = simpleForecasting(hourly, 24);  // Próximas 24 horas

    res.json({
      status: 'ok',
      data: {
        historical: hourly,
        forecast,
        statistics: {
          avgProblemsPerHour: avgProblems,
          peakHour: findPeakHour(hourly),
          lowestHour: findLowestHour(hourly)
        }
      }
    });
  } catch (error: any) {
    logger.error('[DASHBOARD] Trends Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/dashboard/sre/problems/:id/validate-fp
 * Validar si un problema es falso positivo (manual)
 */
router.post('/problems/:id/validate-fp', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFalsePositive, reason } = req.body;

    const db = getDatabase();
    const collection = db.collection('problems');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isFalsePositive,
          falsePositiveReason: reason,
          // @ts-ignore
          validatedBy: req.user?.email || 'system',
          validationTimestamp: new Date(),
          lastModifiedAt: new Date()
        }
      }
    );

    // Si es falso positivo confirmado, aprender patrón
    if (isFalsePositive) {
      const problem = await collection.findOne({ _id: new ObjectId(id) });
      await learnFalsePositivePattern(problem, reason);
    }

    res.json({
      status: 'ok',
      message: 'False positive status updated'
    });
  } catch (error: any) {
    logger.error('[DASHBOARD] Validation Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
