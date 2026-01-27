/**
 * Manual Dynatrace Sync Script
 * Run to manually trigger a sync with Dynatrace
 */
import { validateDynatraceConfig } from '../src/config/dynatrace.config';
import { dynatraceService } from '../src/services/dynatraceService';
import { dynatraceSyncService } from '../src/services/dynatraceSyncService';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';

async function syncDynatraceProblems(): Promise<void> {
  try {
    console.log('');
    console.log('========================================');
    console.log(' Dynatrace Manual Sync');
    console.log('========================================');
    console.log('');

    // 1. Validate config
    console.log('📋 Validating configuration...');
    const validation = validateDynatraceConfig();
    if (!validation.valid) {
      console.error('❌ Configuration errors:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
      throw new Error('Invalid configuration');
    }
    console.log('✅ Configuration valid');

    // 2. Test Dynatrace connection
    console.log('');
    console.log('📋 Testing Dynatrace connection...');
    const connectionOk = await dynatraceService.testConnection();
    if (!connectionOk) {
      throw new Error('Dynatrace connection failed');
    }

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-uno';

    // 3. Initialize MongoDB
    console.log('');
    console.log(`📋 Connecting to MongoDB (${MONGODB_DB_NAME})...`);
    await dynatraceSyncService.initMongoDB(MONGODB_URI, COLLECTION_NAME, MONGODB_DB_NAME);

    // 4. Ensure indexes
    await dynatraceSyncService.ensureIndexes();

    // 5. Run sync
    console.log('');
    console.log('📋 Starting synchronization...');
    const stats = await dynatraceSyncService.syncProblems();

    // 6. Get final stats
    const dbStats = await dynatraceSyncService.getStats();

    console.log('');
    console.log('========================================');
    console.log(' ✅ Sync Complete!');
    console.log('========================================');
    console.log('');
    console.log('Sync Results:');
    console.log(`  - Total fetched: ${stats.totalProblems}`);
    console.log(`  - Inserted: ${stats.inserted}`);
    console.log(`  - Updated: ${stats.updated}`);
    console.log(`  - Failed: ${stats.failed}`);
    console.log('');
    console.log('Database Status:');
    console.log(`  - Total problems: ${dbStats.totalProblems}`);
    console.log(`  - Open problems: ${dbStats.openProblems}`);
    console.log(`  - Storage: ${dbStats.storage.sizeGB.toFixed(2)} GB`);
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Sync failed:', error.message);
    throw error;
  } finally {
    await dynatraceSyncService.close();
  }
}

// Run
syncDynatraceProblems()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
