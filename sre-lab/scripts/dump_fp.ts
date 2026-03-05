import * as dotenv from 'dotenv';
dotenv.config();
import { database } from './src/config/database';
import { FalsePositiveService } from './src/services/false-positive.service';
import { chronicOffendersService } from './src/services/chronicOffenders.service';
import * as fs from 'fs';

async function run() {
  try {
    console.log('Connecting to database...');
    await database.connect();
    const db = database.getDb();
    
    console.log('Initializing services...');
    const fpService = new FalsePositiveService(db, 'problems');
    chronicOffendersService.setCollection(db);

    console.log('Running summary analysis...');
    // We'll analyze for a broad time range or without dates to get all downloaded problems
    const summary = await fpService.getSummaryFast();
    
    console.log('Gathering chronic offenders...');
    const chronicOffenders = await chronicOffendersService.getChronicOffenders(50);
    
    console.log('Gathering Phase 2.5 summary...');
    const phase25 = await chronicOffendersService.getPhase25Summary();

    const result = {
      summary,
      chronicOffenders,
      phase25
    };

    fs.writeFileSync('fp_analysis_dump.json', JSON.stringify(result, null, 2));
    console.log('Analysis complete. Results written to fp_analysis_dump.json');
    
  } catch (err) {
    console.error('Error running analysis:', err);
  } finally {
    process.exit(0);
  }
}

run();
