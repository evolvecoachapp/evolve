import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import {
  assertValidTableName,
  createRepositoryTableSql,
  initializeSQLiteSchema,
} from "./SQLiteSchema";

export interface SQLiteEngineRow {
  readonly id: string;
  readonly payload: string;
}

export interface SQLiteEngineSnapshot {
  readonly tables: ReadonlyMap<string, ReadonlyMap<string, SQLiteEngineRow>>;
  readonly kv: ReadonlyMap<string, string>;
  readonly meta: ReadonlyMap<string, string>;
}

export const SQLITE_ADAPTER_VERSION = "1.0.0";
export const SQLITE_DATABASE_VERSION = "1";

function resolveDatabaseFileName(databaseName: string): string {
  return databaseName.endsWith(".db") ? databaseName : `${databaseName}.db`;
}

/**
 * Native persistent SQLite engine backed by Expo SQLite.
 * Infrastructure only — no Domain imports.
 */
export class SQLiteEngine {
  private readonly databaseName: string;
  private db: SQLiteDatabase | null;
  private open = true;
  private transactionDepth = 0;

  constructor(databaseName = "evolve-sqlite") {
    this.databaseName = resolveDatabaseFileName(databaseName);
    this.db = openDatabaseSync(this.databaseName);
    initializeSQLiteSchema(this.db);
    this.ensureMetaDefaults();
  }

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    if (!this.open) {
      return;
    }
    this.db?.closeSync();
    this.db = null;
    this.open = false;
    this.transactionDepth = 0;
  }

  ensureTable(tableName: string): void {
    this.assertOpen();
    assertValidTableName(tableName);
    this.database.execSync(createRepositoryTableSql(tableName));
  }

  getRow(tableName: string, id: string): SQLiteEngineRow | null {
    this.assertOpen();
    assertValidTableName(tableName);
    const row = this.database.getFirstSync<{ id: string; payload: string }>(
      `SELECT id, payload FROM "${tableName}" WHERE id = ?`,
      id,
    );
    return row ? Object.freeze({ id: row.id, payload: row.payload }) : null;
  }

  listRows(tableName: string): readonly SQLiteEngineRow[] {
    this.assertOpen();
    assertValidTableName(tableName);
    const rows = this.database.getAllSync<{ id: string; payload: string }>(
      `SELECT id, payload FROM "${tableName}"`,
    );
    return Object.freeze(
      rows.map((row) => Object.freeze({ id: row.id, payload: row.payload })),
    );
  }

  upsertRow(tableName: string, row: SQLiteEngineRow): void {
    this.assertOpen();
    this.ensureTable(tableName);
    this.database.runSync(
      `INSERT INTO "${tableName}" (id, payload) VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET payload = excluded.payload`,
      row.id,
      row.payload,
    );
  }

  deleteRow(tableName: string, id: string): boolean {
    this.assertOpen();
    assertValidTableName(tableName);
    const result = this.database.runSync(
      `DELETE FROM "${tableName}" WHERE id = ?`,
      id,
    );
    return result.changes > 0;
  }

  hasRow(tableName: string, id: string): boolean {
    return this.getRow(tableName, id) !== null;
  }

  readKv(key: string): string | null {
    this.assertOpen();
    const row = this.database.getFirstSync<{ value: string }>(
      "SELECT value FROM kv WHERE key = ?",
      key,
    );
    return row?.value ?? null;
  }

  writeKv(key: string, value: string): void {
    this.assertOpen();
    this.database.runSync(
      `INSERT INTO kv (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value,
    );
  }

  deleteKv(key: string): boolean {
    this.assertOpen();
    const result = this.database.runSync("DELETE FROM kv WHERE key = ?", key);
    return result.changes > 0;
  }

  hasKv(key: string): boolean {
    this.assertOpen();
    const row = this.database.getFirstSync<{ one: number }>(
      "SELECT 1 AS one FROM kv WHERE key = ?",
      key,
    );
    return row !== null;
  }

  clearKv(): void {
    this.assertOpen();
    this.database.runSync("DELETE FROM kv");
  }

  getMeta(key: string): string | null {
    this.assertOpen();
    const row = this.database.getFirstSync<{ value: string }>(
      "SELECT value FROM meta WHERE key = ?",
      key,
    );
    return row?.value ?? null;
  }

  storageUsageBytes(): number {
    this.assertOpen();
    const pageCount = this.database.getFirstSync<{ page_count: number }>(
      "PRAGMA page_count",
    );
    const pageSize = this.database.getFirstSync<{ page_size: number }>(
      "PRAGMA page_size",
    );
    return (pageCount?.page_count ?? 0) * (pageSize?.page_size ?? 0);
  }

  beginTransaction(): void {
    this.assertOpen();
    if (this.transactionDepth > 0) {
      throw new Error("Transaction already open");
    }
    this.database.execSync("BEGIN IMMEDIATE");
    this.transactionDepth = 1;
  }

  commitTransaction(): void {
    this.assertOpen();
    if (this.transactionDepth === 0) {
      throw new Error("No transaction to commit");
    }
    this.database.execSync("COMMIT");
    this.transactionDepth = 0;
  }

  rollbackTransaction(): void {
    this.assertOpen();
    if (this.transactionDepth === 0) {
      throw new Error("No transaction to rollback");
    }
    this.database.execSync("ROLLBACK");
    this.transactionDepth = 0;
  }

  isInTransaction(): boolean {
    return this.transactionDepth > 0;
  }

  private ensureMetaDefaults(): void {
    if (!this.getMeta("database_version")) {
      this.writeMeta("database_version", SQLITE_DATABASE_VERSION);
    }
    if (!this.getMeta("adapter_version")) {
      this.writeMeta("adapter_version", SQLITE_ADAPTER_VERSION);
    }
  }

  private writeMeta(key: string, value: string): void {
    this.database.runSync(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      key,
      value,
    );
  }

  private get database(): SQLiteDatabase {
    if (!this.db) {
      throw new Error("SQLite connection is closed");
    }
    return this.db;
  }

  private assertOpen(): void {
    if (!this.open) {
      throw new Error("SQLite connection is closed");
    }
  }
}
