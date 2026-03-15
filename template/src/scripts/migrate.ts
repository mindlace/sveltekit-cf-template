#!/usr/bin/env npx tsx

/**
 * Runs wrangler d1 migrations apply for the project's D1 database.
 * Pass --remote to apply to the remote (production) database.
 */

import { execSync } from 'child_process';

const isRemote = process.argv.includes('--remote');
const remoteFlag = isRemote ? '--remote' : '--local';

// Read database binding name from wrangler.jsonc
import { readFileSync } from 'fs';
import { join } from 'path';

const wranglerPath = join(process.cwd(), 'wrangler.jsonc');
const wranglerContent = readFileSync(wranglerPath, 'utf-8');
// Strip JSONC comments
const jsonContent = wranglerContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const config = JSON.parse(jsonContent);
const dbName = config.d1_databases?.[0]?.database_name ?? config.name;

console.log(`Applying migrations ${remoteFlag} for database: ${dbName}`);

execSync(`npx wrangler d1 migrations apply ${dbName} ${remoteFlag}`, {
  stdio: 'inherit',
  cwd: process.cwd()
});
