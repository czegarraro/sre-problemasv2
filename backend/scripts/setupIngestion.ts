/**
 * Setup Ingestion Script
 * Run once to initialize collections and indexes
 */
import { MongoClient } from 'mongodb';
import { validateDynatraceConfig } from '../src/config/dynatrace.config';
import { retentionConfig } from '../src/config/retention.config';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-uno';

async function setupIngestion(): Promise<void> {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('');
    console.log('========================================');
    console.log(' Ingestion Setup');
    console.log('========================================');
    console.log('');

    // 1. Validate Dynatrace config
    console.log('📋 Validating Dynatrace configuration...');
    const validation = validateDynatraceConfig();
    if (!validation.valid) {
      console.error('❌ Dynatrace configuration errors:');
      validation.errors.forEach(err => console.error(`   - ${err}`));
      throw new Error('Invalid Dynatrace configuration');
    }
    console.log('✅ Dynatrace configuration valid');

    // 2. Connect to MongoDB
    console.log('');
    console.log(`📋 Connecting to MongoDB (${MONGODB_DB_NAME})...`);
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    console.log('✅ MongoDB connected');

    // 3. Create collections
    console.log('');
    console.log('📋 Creating collections...');
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Active collection
    if (!collectionNames.includes(retentionConfig.activeCollection)) {
      await db.createCollection(retentionConfig.activeCollection);
      console.log(`✅ Created collection: ${retentionConfig.activeCollection}`);
    } else {
      console.log(`ℹ️  Collection exists: ${retentionConfig.activeCollection}`);
    }

    // Archive collection
    if (!collectionNames.includes(retentionConfig.archiveCollection)) {
      await db.createCollection(retentionConfig.archiveCollection);
      console.log(`✅ Created collection: ${retentionConfig.archiveCollection}`);
    } else {
      console.log(`ℹ️  Collection exists: ${retentionConfig.archiveCollection}`);
    }

    // 4. Create indexes
    console.log('');
    console.log('📋 Creating indexes...');
    
    const activeCollection = db.collection(retentionConfig.activeCollection);
    
    await activeCollection.createIndex({ dynatraceId: 1 }, { unique: true, sparse: true });
    await activeCollection.createIndex({ startTime: -1 });
    await activeCollection.createIndex({ status: 1, severityLevel: -1 });
    await activeCollection.createIndex({ lastSyncAt: -1 });
    await activeCollection.createIndex({ 'managementZones.name': 1 });
    
    console.log('✅ Indexes created');

    // 5. Summary
    console.log('');
    console.log('========================================');
    console.log(' ✅ Setup Complete!');
    console.log('========================================');
    console.log('');
    console.log('Configuration:');
    console.log(`  - Active collection: ${retentionConfig.activeCollection}`);
    console.log(`  - Archive collection: ${retentionConfig.archiveCollection}`);
    console.log(`  - Retention days: ${retentionConfig.retentionDays}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. npm run sync-dynatrace (test manual sync)');
    console.log('  2. npm run dev (start server with cron jobs)');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

// Run
setupIngestion()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
