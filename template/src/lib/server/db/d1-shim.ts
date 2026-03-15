/**
 * D1Database shim over better-sqlite3 for testing.
 *
 * Implements the subset of the D1Database / D1PreparedStatement interface
 * that drizzle-orm/d1 actually uses, backed by a synchronous better-sqlite3
 * database instance. Every method returns a resolved Promise so the caller
 * sees the same async API as real D1.
 */
import type BetterSqlite3 from 'better-sqlite3';

interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}

interface BoundStatement {
  bind(...values: unknown[]): BoundStatement;
  run(): Promise<D1Result>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T extends unknown[] = unknown[]>(): Promise<T[]>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
}

export interface D1Shim {
  prepare(sql: string): BoundStatement;
  batch<T = unknown>(stmts: BoundStatement[]): Promise<D1Result<T>[]>;
  exec(sql: string): Promise<D1Result>;
}

export function createD1Shim(sqlite: BetterSqlite3.Database): D1Shim {
  // Enable foreign key enforcement to match D1 behavior
  sqlite.pragma('foreign_keys = ON');

  function makePrepared(sql: string, boundValues: unknown[] = []): BoundStatement {
    return {
      bind(...values: unknown[]): BoundStatement {
        return makePrepared(sql, values);
      },

      run(): Promise<D1Result> {
        const stmt = sqlite.prepare(sql);
        const info = stmt.run(...boundValues);
        return Promise.resolve({
          results: [],
          success: true,
          meta: {
            changes: info.changes,
            last_row_id: info.lastInsertRowid,
            duration: 0
          }
        });
      },

      all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
        const stmt = sqlite.prepare(sql);
        const rows = stmt.all(...boundValues) as T[];
        return Promise.resolve({
          results: rows,
          success: true,
          meta: { duration: 0 }
        });
      },

      raw<T extends unknown[] = unknown[]>(): Promise<T[]> {
        const stmt = sqlite.prepare(sql);
        const rows = stmt.raw().all(...boundValues) as T[];
        return Promise.resolve(rows);
      },

      first<T = Record<string, unknown>>(colName?: string): Promise<T | null> {
        const stmt = sqlite.prepare(sql);
        const row = stmt.get(...boundValues) as Record<string, unknown> | undefined;
        if (!row) return Promise.resolve(null);
        if (colName) return Promise.resolve(row[colName] as T);
        return Promise.resolve(row as T);
      }
    };
  }

  return {
    prepare(sql: string): BoundStatement {
      return makePrepared(sql);
    },

    batch<T = unknown>(stmts: BoundStatement[]): Promise<D1Result<T>[]> {
      const results: D1Result<T>[] = [];
      const transaction = sqlite.transaction(() => {
        for (const stmt of stmts) {
          let result: D1Result<T> | undefined;
          void stmt.all<T>().then((r) => {
            result = r;
          });
          results.push(result!);
        }
      });
      transaction();
      return Promise.resolve(results);
    },

    exec(sql: string): Promise<D1Result> {
      sqlite.exec(sql);
      return Promise.resolve({
        results: [],
        success: true,
        meta: { duration: 0 }
      });
    }
  };
}
