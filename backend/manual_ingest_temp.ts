/**
 * Manual Trigger for Ingestion Job
 * Use this to fetch data immediately without waiting for cron
 */
import { runDailyIngestionJob } from './src/jobs/dailyIngestionJob';
import { database } from './src/config/database';
import logger from './src/utils/logger';

async function runManualIngest() {
  try {
    console.log('🚀 Starting Manual Ingestion Trigger...');
    
    // Connect to DB first (job expects DB connection)
    await database.connect();
    
    console.log('📦 Executing Ingestion Job...');
    await runDailyIngestionJob();
    
    console.log('✅ Manual Ingestion Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Manual Ingestion Failed:', error);
    process.exit(1);
  }
}

runManualIngest();
