import type { SQLiteDatabase } from "expo-sqlite";

/** Repository tables created on first open. No migration system yet. */
export const SQLITE_REPOSITORY_TABLES = [
  "athlete",
  "identity",
  "workspace",
  "snapshot",
  "timeline",
  "workout",
  "nutrition",
  "recovery",
  "settings",
  "runtime",
] as const;

const TABLE_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

export function assertValidTableName(tableName: string): void {
  if (!TABLE_NAME_PATTERN.test(tableName)) {
    throw new Error(`Invalid SQLite table name: ${tableName}`);
  }
}

function createRecordTableSql(tableName: string): string {
  assertValidTableName(tableName);
  return `CREATE TABLE IF NOT EXISTS "${tableName}" (
    id TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL
  );`;
}

/**
 * Idempotent schema initialization for a native SQLite database.
 * No migration system yet — CREATE TABLE IF NOT EXISTS only.
 */
export function initializeSQLiteSchema(db: SQLiteDatabase): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  for (const tableName of SQLITE_REPOSITORY_TABLES) {
    db.execSync(createRecordTableSql(tableName));
  }
}

export function createRepositoryTableSql(tableName: string): string {
  return createRecordTableSql(tableName);
}
