import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') }); // Load .env from apps/api maybe or assume process.env works if called inside app

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:8Wave!@0.0.0.0:5432/taskmanager';

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
