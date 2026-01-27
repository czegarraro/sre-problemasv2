
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';

// Load env before imports that might use it
config({ path: path.join(__dirname, '../../.env') });

import { FalsePositiveDetectionService } from '../services/falsePositiveDetectionService';
import { CorrelationService } from '../services/correlationService';
import logger from '../utils/logger';

// Mock getDatabase for standalone script usage if needed, 
// or just connect directly and pass objects if services allow, 
// but services use `getDatabase()` singleton usually.
// We need to initialize the database connection for the services to work.
import { database, getDatabase } from '../config/database';

const fpService = new FalsePositiveDetectionService();
const correlationService = new CorrelationService();

async function runAnalysis() {
  try {
    logger.info('Starting SRE Analysis on existing data...');
    
    // Check if mongo uri is defined
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
    }

    await database.connect();
    const db = getDatabase();
    const collection = db.collection('problems');

    const problems = await collection.find({}).toArray();
    logger.info(`Found ${problems.length} problems to analyze.`);

    let processed = 0;
    let falsePositives = 0;

    for (const problem of problems) {
      // @ts-ignore
      const fpResult = await fpService.analyzeProblem(problem);
      
      const updates: any = {
        isFalsePositive: fpResult.isFalsePositive,
        falsePositiveScore: fpResult.score,
        falsePositiveReason: fpResult.reasons.join('; '),
        // Simple mock categorization if missing
        category: problem.category || ((problem.title && problem.title.includes('Failure')) ? 'ERROR_RATE' : 'AVAILABILITY')
      };

      if (fpResult.isFalsePositive) falsePositives++;

      if (fpResult.isFalsePositive) falsePositives++;

      // Potential correlation logic (disabled for initial backfill)
      // await correlationService.correlateProblems(problem);

      await collection.updateOne(
        { _id: problem._id },
        { $set: updates }
      );

      processed++;
      if (processed % 100 === 0) {
        process.stdout.write(`Processed ${processed}/${problems.length}... \r`);
      }
    }

    logger.success(`\nAnalysis complete.`);
    logger.info(`Total Processed: ${processed}`);
    logger.info(`Detected False Positives: ${falsePositives}`);
    logger.info(`FP Rate: ${((falsePositives / processed) * 100).toFixed(2)}%`);

  } catch (error) {
    logger.error('Analysis failed', error);
  } finally {
    // Only close if we connected
    if (database.isConnected()) {
        await database.close();
    }
    process.exit(0);
  }
}

runAnalysis();
