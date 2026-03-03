import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars from process.cwd() (backend/)
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { database } from '../src/config/database';
import { SquadService } from '../src/services/squad.service';

async function sync() {
  try {
    await database.connect();
    const service = new SquadService();
    console.log('🔄 Sincronizando squads con datos mockeados...');
    await service.syncSquadsFromProblems();
    console.log('✅ Sincronización completa.');
    await database.close();
  } catch (err) {
    console.error('❌ Error en sincronización:', err);
    process.exit(1);
  }
}

sync();
