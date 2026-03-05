/**
 * Standalone Backfill Script (Dry Run / Calculator Mode)
 * Run with: npx tsx standalone_backfill.ts <toleranceMs>
 */
import { MongoClient } from 'mongodb';

// HARDCODED CONFIG (From .env)
const URI = "mongodb+srv://czegarra_db_user:NF2dkcE5VlBCDNVM@cluster0.rkm5mgr.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";
const DB_NAME = "problemas-dynatrace-dos";
const COLLECTION_NAME = "problems";

const args = process.argv.slice(2);
const TOLERANCE = parseInt(args[0] || "500");

// ==========================================
// FALSE POSITIVE LOGIC
// ==========================================
const falsePositiveConfig = {
  patterns: {
    excludeTitles: [
      'no deployment pods', 'deployment event', 'pod eviction', 
      'synthetic monitor failed', 'host unavailable'
    ],
  },
  thresholds: {
    impact: { ignoredPercentage: 30 },
    performance: { baselineMs: 200, toleranceMs: TOLERANCE }
  },
  scores: {
    baseScore: 0,
    lowImpactPenalty: 40,
    noisePatternPenalty: 100,
    tolerablePerfPenalty: 30, // Score added if latency < tolerance
    quickRecoveryBonus: 20,
    repeatOffenderPenalty: 10,
  }
};

function analyzeProblem(problem: any) {
    let score = falsePositiveConfig.scores.baseScore;
    const reasons: string[] = [];
    let classification = 'VALID_INCIDENT';

    // 1. Noise Patterns
    const titleLower = (problem.title || '').toLowerCase();
    const isExcluded = falsePositiveConfig.patterns.excludeTitles.some(pattern => 
      titleLower.includes(pattern.toLowerCase())
    );

    if (isExcluded) {
      score += falsePositiveConfig.scores.noisePatternPenalty;
      reasons.push('Matches known noise pattern');
      classification = 'NOISE';
    }

    // 2. Performance Analysis (Updated Logic)
    let maxLatencyMs = 0;
    
    if (problem.evidenceDetails && problem.evidenceDetails.details) {
        for (const detail of problem.evidenceDetails.details) {
            // Check Transactional Evidence (Best Source)
            if (detail.unit === 'MicroSecond' && detail.valueAfterChangePoint) {
                const ms = detail.valueAfterChangePoint / 1000;
                if (ms > maxLatencyMs) maxLatencyMs = ms;
            }
            // Check Event Properties (Fallback)
            else if (detail.data && detail.data.properties) {
                 const p90Prop = detail.data.properties.find((p: any) => p.key && p.key.includes('response_time_p90'));
                 if (p90Prop && p90Prop.value) {
                     const ms = parseFloat(p90Prop.value) / 1000;
                     if (ms > maxLatencyMs) maxLatencyMs = ms;
                 }
            }
        }
    }

    // Apply Tolerance Rule
    if (maxLatencyMs > 0) {
        if (maxLatencyMs < falsePositiveConfig.thresholds.performance.toleranceMs) {
             score += falsePositiveConfig.scores.tolerablePerfPenalty;
             reasons.push(`Latency (${maxLatencyMs.toFixed(0)}ms) within tolerance`);
             if (classification === 'VALID_INCIDENT') classification = 'TOLERABLE_PERF';
        }
    }

    // 3. Quick Recovery
    const durationMin = problem.duration;
    if (durationMin > 0 && durationMin < 5) {
        score += falsePositiveConfig.scores.quickRecoveryBonus;
        reasons.push('Auto-resolved quickly (< 5 min)');
        if (classification === 'VALID_INCIDENT') classification = 'LOW_IMPACT';
    }

    const isFalsePositive = score >= 50;

    return { isFalsePositive, classification };
}

// ==========================================
// MAIN EXECUTION
// ==========================================
async function run() {
  console.log(`🚀 Starting Analysis (Tolerance: ${TOLERANCE}ms)...`);
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const problems = await db.collection(COLLECTION_NAME).find({}).toArray();
    
    console.log(`📦 Analyzing ${problems.length} records...`);
    
    // In-memory analysis only (Fast)
    const stats: any = {
        TOTAL: problems.length,
        FALSE_POSITIVE: 0,
        NOISE: 0,
        TOLERABLE_PERF: 0,
        LOW_IMPACT: 0,
        VALID_INCIDENT: 0
    };

    problems.forEach(p => {
        const analysis = analyzeProblem(p);
        stats[analysis.classification] = (stats[analysis.classification] || 0) + 1;
        if (analysis.isFalsePositive) stats.FALSE_POSITIVE++;
    });

    console.log('__STATS_START__');
    console.log(JSON.stringify(stats));
    console.log('__STATS_END__');
    
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
