import { database } from '../config/database';
import { SquadService } from '../services/squad.service';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function sync() {
  try {
    console.log('CWD:', process.cwd());
    await database.connect();
    const service = new SquadService();
    console.log('🔄 Sincronizando squads...');
    await service.syncSquadsFromProblems();
    console.log('✅ Sincronización completa.');
    await database.close();
  } catch (err) {
    console.error('❌ Error en sincronización:', err);
    if (err instanceof Error) {
        console.error('Stack:', err.stack);
    }
    process.exit(1);
  }
}

sync();
