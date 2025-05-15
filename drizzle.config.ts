import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL_UNPOOLED;

if (!connectionString)
  throw new Error('`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment');

export default defineConfig({
  schema: './src/database/schemas',
  out: './src/database/migrations',
  dialect: 'postgresql',
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
