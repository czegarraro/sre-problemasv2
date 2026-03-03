import { ProblemRepository } from './src/repositories/problem.repository';
import { database } from './src/config/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkOptions() {
  try {
    await database.connect();
    const repo = new ProblemRepository();
    const options = await repo.getFilterOptions();
    console.log('Filter Options Tags:', options.tags);
    
    // Find one problem to see what it has
    const problem = await database.getCollection().findOne({});
    console.log('Sample Problem keys:', Object.keys(problem || {}));
    if (problem?.entityTags) {
        console.log('Sample Problem entityTags type:', typeof problem.entityTags);
        console.log('Sample Problem entityTags:', JSON.stringify(problem.entityTags, null, 2));
    }

    await database.close();
  } catch (err) {
    console.error(err);
  }
}

checkOptions();
