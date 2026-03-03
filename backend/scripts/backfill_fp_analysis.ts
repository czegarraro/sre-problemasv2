/**
 * Backfill False Positive Analysis
 * Applies SRE rules to existing problems in MongoDB
 */
import { database } from '../src/config/database';
import { falsePositiveService } from '../src/services/falsePositiveDetectionService';
import logger from '../src/utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';
const DB_NAME = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-uno';

async function backfillAnalysis() {
  try {
    console.log('🚀 Starting False Positive Backfill...');
    
    // Connect to specific DB
    await database.connect();
    const db = database.getDb(); // This gets the default connected DB, we might need to ensure it matches DB_NAME if connection string differs, but usually URI defines it.
    
    // Explicitly assume the URI points to the right cluster, but we might need to switch DB if the default is different.
    // However, database.connect() uses MONGODB_URI.
    
    const collection = db.collection(COLLECTION_NAME);
    const problems = await collection.find({}).toArray();
    
    console.log(`📦 Found ${problems.length} problems to analyze.`);
    
    let updatedCount = 0;
    const batchSize = 100;
    
    // Process in batches
    for (let i = 0; i < problems.length; i += batchSize) {
      const batch = problems.slice(i, i + batchSize);
      const updates = batch.map(prob => {
        const analysis = falsePositiveService.analyzeProblem(prob);
        
        return {
          updateOne: {
            filter: { _id: prob._id },
            update: {
              $set: {
                isFalsePositive: analysis.isFalsePositive,
                falsePositiveScore: analysis.score,
                falsePositiveReason: analysis.reasons.join('; '),
                classification: analysis.classification,
                // categorization help
                category: prob.title?.includes('Failure') ? 'ERROR_RATE' : 'AVAILABILITY' 
              }
            }
          }
        };
      });
      
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
