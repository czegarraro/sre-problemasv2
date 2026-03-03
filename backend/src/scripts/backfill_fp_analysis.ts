import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from backend root (since we are in src/scripts)
// Must be done BEFORE importing database/services to ensure process.env is populated
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';

async function backfillAnalysis() {
  try {
    console.log('🚀 Starting False Positive Backfill...');
    
    // Dynamic imports to ensure env vars are loaded first
    const { database } = await import('../config/database');
    const { falsePositiveService } = await import('../services/falsePositiveDetectionService');
    const { default: logger } = await import('../utils/logger');

    // Connect to specific DB
    await database.connect();
    const db = database.getDb();

    const collection = db.collection(COLLECTION_NAME);
    const problems = await collection.find({}).toArray();
    
    console.log(`📦 Found ${problems.length} problems to analyze.`);
    
    let updatedCount = 0;
    const batchSize = 100;
    
     // Process in batches
    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize);
      
      // Use Promise.all to run async analysis for the batch
      // This is crucial for "Flapping Detection" which requires DB lookups
      const updates = await Promise.all(batch.map(async (prob) => {
        const analysis = await falsePositiveService.analyzeProblemAsync(prob);
        
        return {
          updateOne: {
            filter: { _id: prob._id },
            update: {
              $set: {
                isFalsePositive: analysis.isFalsePositive,
                falsePositiveScore: analysis.score,
                falsePositiveReason: analysis.reasons.join('; '),
                classification: analysis.classification,
                isFlapping: analysis.isFlapping || false,
                isMaintenanceWindow: analysis.isMaintenanceWindow || false,
                maintenanceReason: analysis.maintenanceReason || null,
                category: prob.title?.includes('Failure') ? 'ERROR_RATE' : 'AVAILABILITY' 
              }
            }
          }
        };
      }));
      
      if (updates.length > 0) {
        await collection.bulkWrite(updates);
        updatedCount += updates.length;
        process.stdout.write(`\r✅ Processed ${updatedCount}/${problems.length}...`);
      }
    }
    
    console.log('\n✨ Backfill Complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Backfill Failed:', error);
    process.exit(1);
  }
}

backfillAnalysis();
