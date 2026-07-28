import type { StorageAdapter } from "../../../core/infrastructure/adapters/StorageAdapter";
import {
  createAdapterResult,
  type AdapterResult,
} from "../../../core/infrastructure/registry/AdapterResult";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import type { SQLiteRepositories } from "../repositories";
import { createSQLiteRepositories } from "../repositories";
import type { ConnectionHealth, SQLiteHealthReport } from "../health/ConnectionHealth";

/**
 * SQLite infrastructure adapter implementing StorageAdapter.
 * Depends on Persistence Contracts / Infrastructure contracts — Domain never imports this.
 */
export class SQLiteAdapter implements StorageAdapter {
  readonly adapterId = "storage" as const;

  readonly connection: SQLiteConnection;
  readonly repositories: SQLiteRepositories;
  readonly health: ConnectionHealth;

  constructor(connection: SQLiteConnection) {
    this.connection = connection;
    this.repositories = createSQLiteRepositories(connection);
    this.health = connection.health;
  }

  read(key: string): AdapterResult<string | null> {
    const result = this.connection.read(key);
    return createAdapterResult({
      success: result.success,
      value: result.value,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  write(key: string, value: string): AdapterResult<void> {
    const result = this.connection.write(key, value);
    return createAdapterResult({
      success: result.success,
      value: result.value,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  delete(key: string): AdapterResult<void> {
    const result = this.connection.remove(key);
    return createAdapterResult({
      success: result.success,
      value: result.value,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  exists(key: string): AdapterResult<boolean> {
    const result = this.connection.has(key);
    return createAdapterResult({
      success: result.success,
      value: result.value,
      errorCode: result.errorCode,
      message: result.message,
    });
  }

  getHealthReport(): SQLiteHealthReport {
    return this.health.report();
  }
}
