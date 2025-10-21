// For Node.js - make sure to install the 'ws' and 'bufferutil' packages
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

import * as schema from '../schemas';

export type AdiaDatabaseSchema = typeof schema;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const dbPool = drizzle({ client: pool, schema });
