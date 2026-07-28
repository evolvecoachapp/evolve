/**
 * Pure TypeScript SQLite-compatible engine.
 *
 * No React Native. No Expo. No native SQLite bindings.
 * Tables are named collections of id/payload rows with transaction snapshots.
 */

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

export class SQLiteEngine {
  private readonly tables = new Map<string, Map<string, SQLiteEngineRow>>();
  private readonly kv = new Map<string, string>();
  private readonly meta = new Map<string, string>();
  private snapshot: SQLiteEngineSnapshot | null = null;
  private open = true;

  constructor() {
    this.meta.set("database_version", SQLITE_DATABASE_VERSION);
    this.meta.set("adapter_version", SQLITE_ADAPTER_VERSION);
  }

  isOpen(): boolean {
    return this.open;
  }

  close(): void {
    this.open = false;
    this.tables.clear();
    this.kv.clear();
    this.meta.clear();
    this.snapshot = null;
  }

  ensureTable(tableName: string): void {
    this.assertOpen();
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new Map());
    }
  }

  getRow(tableName: string, id: string): SQLiteEngineRow | null {
    this.assertOpen();
    const table = this.tables.get(tableName);
    if (!table) return null;
    return table.get(id) ?? null;
  }

  listRows(tableName: string): readonly SQLiteEngineRow[] {
    this.assertOpen();
    const table = this.tables.get(tableName);
    if (!table) return Object.freeze([]);
    return Object.freeze([...table.values()].map((row) => Object.freeze({ ...row })));
  }

  upsertRow(tableName: string, row: SQLiteEngineRow): void {
    this.assertOpen();
    this.ensureTable(tableName);
    const table = this.tables.get(tableName)!;
    table.set(row.id, Object.freeze({ id: row.id, payload: row.payload }));
  }

  deleteRow(tableName: string, id: string): boolean {
    this.assertOpen();
    const table = this.tables.get(tableName);
    if (!table) return false;
    return table.delete(id);
  }

  hasRow(tableName: string, id: string): boolean {
    this.assertOpen();
    const table = this.tables.get(tableName);
    return table?.has(id) ?? false;
  }

  readKv(key: string): string | null {
    this.assertOpen();
    return this.kv.has(key) ? (this.kv.get(key) ?? null) : null;
  }

  writeKv(key: string, value: string): void {
    this.assertOpen();
    this.kv.set(key, value);
  }

  deleteKv(key: string): boolean {
    this.assertOpen();
    return this.kv.delete(key);
  }

  hasKv(key: string): boolean {
    this.assertOpen();
    return this.kv.has(key);
  }

  clearKv(): void {
    this.assertOpen();
    this.kv.clear();
  }

  getMeta(key: string): string | null {
    this.assertOpen();
    return this.meta.has(key) ? (this.meta.get(key) ?? null) : null;
  }

  storageUsageBytes(): number {
    this.assertOpen();
    let total = 0;
    for (const table of this.tables.values()) {
      for (const row of table.values()) {
        total += row.id.length + row.payload.length;
      }
    }
    for (const [key, value] of this.kv) {
      total += key.length + value.length;
    }
    for (const [key, value] of this.meta) {
      total += key.length + value.length;
    }
    return total;
  }

  beginTransaction(): void {
    this.assertOpen();
    if (this.snapshot !== null) {
      throw new Error("Transaction already open");
    }
    this.snapshot = this.capture();
  }

  commitTransaction(): void {
    this.assertOpen();
    if (this.snapshot === null) {
      throw new Error("No transaction to commit");
    }
    this.snapshot = null;
  }

  rollbackTransaction(): void {
    this.assertOpen();
    if (this.snapshot === null) {
      throw new Error("No transaction to rollback");
    }
    this.restore(this.snapshot);
    this.snapshot = null;
  }

  isInTransaction(): boolean {
    return this.snapshot !== null;
  }

  private capture(): SQLiteEngineSnapshot {
    const tables = new Map<string, Map<string, SQLiteEngineRow>>();
    for (const [name, table] of this.tables) {
      const copy = new Map<string, SQLiteEngineRow>();
      for (const [id, row] of table) {
        copy.set(id, Object.freeze({ id: row.id, payload: row.payload }));
      }
      tables.set(name, copy);
    }
    return {
      tables,
      kv: new Map(this.kv),
      meta: new Map(this.meta),
    };
  }

  private restore(snapshot: SQLiteEngineSnapshot): void {
    this.tables.clear();
    for (const [name, table] of snapshot.tables) {
      const copy = new Map<string, SQLiteEngineRow>();
      for (const [id, row] of table) {
        copy.set(id, Object.freeze({ id: row.id, payload: row.payload }));
      }
      this.tables.set(name, copy);
    }
    this.kv.clear();
    for (const [key, value] of snapshot.kv) {
      this.kv.set(key, value);
    }
    this.meta.clear();
    for (const [key, value] of snapshot.meta) {
      this.meta.set(key, value);
    }
  }

  private assertOpen(): void {
    if (!this.open) {
      throw new Error("SQLite connection is closed");
    }
  }
}
