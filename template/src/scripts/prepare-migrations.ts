#!/usr/bin/env npx tsx

/**
 * Prepares drizzle-kit migrations for D1 by copying SQL files
 * from subdirectories to flat files in the migrations directory.
 *
 * Drizzle-kit generates: migrations/TIMESTAMP_name/migration.sql
 * D1 expects: migrations/NNNN_name.sql
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');

function prepare() {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.log('No migrations directory found.');
    return;
  }

  const entries = readdirSync(MIGRATIONS_DIR);

  // Find subdirectories with migration.sql files (drizzle-kit format)
  const drizzleMigrations = entries
    .filter((entry) => {
      const fullPath = join(MIGRATIONS_DIR, entry);
      return statSync(fullPath).isDirectory() && existsSync(join(fullPath, 'migration.sql'));
    })
    .sort();

  // Find existing flat SQL files to determine next number
  const existingFlat = entries.filter((e) => e.endsWith('.sql')).sort();
  let nextNum = existingFlat.length + 1;

  for (const dir of drizzleMigrations) {
    // Check if this migration has already been flattened
    const alreadyFlattened = existingFlat.some((flat) => {
      const flatContent = readFileSync(join(MIGRATIONS_DIR, flat), 'utf-8');
      const dirContent = readFileSync(join(MIGRATIONS_DIR, dir, 'migration.sql'), 'utf-8');
      return flatContent === dirContent;
    });

    if (alreadyFlattened) {
      continue;
    }

    // Extract a descriptive name from the directory
    const dirName = basename(dir);
    // Remove timestamp prefix if present
    const namePart = dirName.replace(/^\d+_/, '');
    const flatName = `${String(nextNum).padStart(4, '0')}_${namePart}.sql`;

    const sql = readFileSync(join(MIGRATIONS_DIR, dir, 'migration.sql'), 'utf-8');
    writeFileSync(join(MIGRATIONS_DIR, flatName), sql);
    console.log(`Created ${flatName} from ${dir}/migration.sql`);
    nextNum++;
  }

  console.log('Done preparing migrations.');
}

prepare();
