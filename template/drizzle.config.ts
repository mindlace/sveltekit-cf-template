import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_URL ||
  'file:./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite';

export default defineConfig({
  schema: './src/lib/server/db/schema/schema.ts',
  dialect: 'sqlite',
  dbCredentials: { url: databaseUrl },
  verbose: true,
  strict: true,
  out: './migrations'
});
