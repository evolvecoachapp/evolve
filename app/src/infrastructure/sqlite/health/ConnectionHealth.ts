import {
  SQLITE_ADAPTER_VERSION,
  SQLITE_DATABASE_VERSION,
  type SQLiteEngine,
} from "../connection/SQLiteEngine";

/**
 * SQLite connection health probes.
 * No domain logic.
 */
export interface SQLiteHealthReport {
  readonly isConnected: boolean;
  readonly databaseVersion: string;
  readonly storageUsage: number;
  readonly adapterVersion: string;
  readonly checkedAt: string;
}

export class ConnectionHealth {
  constructor(private readonly engine: SQLiteEngine) {}

  isConnected(): boolean {
    return this.engine.isOpen();
  }

  databaseVersion(): string {
    if (!this.engine.isOpen()) {
      return "";
    }
    return this.engine.getMeta("database_version") ?? SQLITE_DATABASE_VERSION;
  }

  storageUsage(): number {
    if (!this.engine.isOpen()) {
      return 0;
    }
    return this.engine.storageUsageBytes();
  }

  adapterVersion(): string {
    if (!this.engine.isOpen()) {
      return SQLITE_ADAPTER_VERSION;
    }
    return this.engine.getMeta("adapter_version") ?? SQLITE_ADAPTER_VERSION;
  }

  report(): SQLiteHealthReport {
    return Object.freeze({
      isConnected: this.isConnected(),
      databaseVersion: this.databaseVersion(),
      storageUsage: this.storageUsage(),
      adapterVersion: this.adapterVersion(),
      checkedAt: new Date().toISOString(),
    });
  }
}
