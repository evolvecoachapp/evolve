import type { PersistenceRecord } from "../../../core/persistence/contracts/PersistenceRecord";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import type { PersistenceMapper } from "../mappers";

/**
 * Shared CRUD for SQLite repositories.
 * Implements Persistence Contract semantics only — no domain logic.
 */
export abstract class SQLiteRepositoryBase {
  protected constructor(
    protected readonly connection: SQLiteConnection,
    protected readonly tableName: string,
    protected readonly mapper: PersistenceMapper,
  ) {
    this.connection.engine.ensureTable(this.tableName);
  }

  findById(id: string): PersistenceRecord | null {
    this.assertConnected();
    const row = this.connection.engine.getRow(this.tableName, id);
    return row ? this.mapper.toRecord(row) : null;
  }

  save(record: PersistenceRecord): void {
    this.assertConnected();
    const row = this.mapper.toRow(record);
    this.connection.engine.upsertRow(this.tableName, row);
  }

  delete(id: string): void {
    this.assertConnected();
    this.connection.engine.deleteRow(this.tableName, id);
  }

  list(): readonly PersistenceRecord[] {
    this.assertConnected();
    return Object.freeze(
      this.connection.engine.listRows(this.tableName).map((row) =>
        this.mapper.toRecord(row),
      ),
    );
  }

  exists(id: string): boolean {
    this.assertConnected();
    return this.connection.engine.hasRow(this.tableName, id);
  }

  private assertConnected(): void {
    if (!this.connection.isConnected()) {
      throw new Error("SQLite connection is closed");
    }
  }
}
