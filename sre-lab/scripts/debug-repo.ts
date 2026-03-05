import { ProblemRepository } from './src/repositories/problem.repository';
import { database } from './src/config/database';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function debugRepo() {
  try {
    await database.connect();
    const repo = new ProblemRepository();
    const problems = await repo.findAllProblems({}, 10);
    console.log('Fetched problems count:', problems.length);
    if (problems.length > 0) {
        console.log('Sample 0 entityTags:', JSON.stringify(problems[0].entityTags, null, 2));
    }
    await database.close();
  } catch (err) {
    console.error(err);
  }
}

debugRepo();
