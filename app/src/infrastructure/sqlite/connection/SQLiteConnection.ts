import {
  createStorageResult,
  type StorageResult,
} from "../../../core/persistence/ports/StorageResult";
import type { StorageReader } from "../../../core/persistence/ports/StorageReader";
import type { StorageWriter } from "../../../core/persistence/ports/StorageWriter";
import type { StorageHealth } from "../../../core/persistence/ports/StorageHealth";
import {
  createStorageHealthStatus,
  type StorageHealthStatus,
} from "../../../core/persistence/ports/StorageHealthStatus";
import { StorageUnavailableError } from "../../../core/persistence/errors";
import { ConnectionHealth } from "../health/ConnectionHealth";
import { SQLiteEngine } from "./SQLiteEngine";
import { SQLiteTransaction } from "./SQLiteTransaction";

export interface SQLiteConnectionOptions {
  readonly name?: string;
}

/**
 * SQLite connection — engine access + storage port facades.
 * No domain logic. Opens a persistent native database automatically.
 */
export class SQLiteConnection {
  readonly name: string;
  readonly engine: SQLiteEngine;
  readonly transactions: SQLiteTransaction;
  readonly health: ConnectionHealth;
  readonly reader: StorageReader;
  readonly writer: StorageWriter;
  readonly healthPort: StorageHealth;

  constructor(options: SQLiteConnectionOptions = {}) {
    this.name = options.name ?? "evolve-sqlite";
    this.engine = new SQLiteEngine(this.name);
    this.transactions = new SQLiteTransaction(this.engine);
    this.health = new ConnectionHealth(this.engine);
    this.reader = this.createReader();
    this.writer = this.createWriter();
    this.healthPort = this.createHealthPort();
  }

  isConnected(): boolean {
    return this.engine.isOpen();
  }

  close(): void {
    this.engine.close();
  }

  read(key: string): StorageResult<string | null> {
    return this.safe(() => this.engine.readKv(key));
  }

  readMany(keys: readonly string[]): StorageResult<readonly (string | null)[]> {
    return this.safe(() =>
      Object.freeze(keys.map((key) => this.engine.readKv(key))),
    );
  }

  has(key: string): StorageResult<boolean> {
    return this.safe(() => this.engine.hasKv(key));
  }

  write(key: string, value: string): StorageResult<void> {
    return this.safe(() => {
      this.engine.writeKv(key, value);
    });
  }

  remove(key: string): StorageResult<void> {
    return this.safe(() => {
      this.engine.deleteKv(key);
    });
  }

  clear(): StorageResult<void> {
    return this.safe(() => {
      this.engine.clearKv();
    });
  }

  check(): StorageResult<StorageHealthStatus> {
    const connected = this.isConnected();
    return createStorageResult({
      success: true,
      value: createStorageHealthStatus({
        healthy: connected,
        checkedAt: new Date().toISOString(),
        message: connected ? null : "SQLite connection is closed",
      }),
    });
  }

  private createReader(): StorageReader {
    return {
      portId: "storage-reader",
      read: (key) => this.safe(() => this.engine.readKv(key)),
      readMany: (keys) =>
        this.safe(() =>
          Object.freeze(keys.map((key) => this.engine.readKv(key))),
        ),
      has: (key) => this.safe(() => this.engine.hasKv(key)),
    };
  }

  private createWriter(): StorageWriter {
    return {
      portId: "storage-writer",
      write: (key, value) =>
        this.safe(() => {
          this.engine.writeKv(key, value);
        }),
      remove: (key) =>
        this.safe(() => {
          this.engine.deleteKv(key);
        }),
      clear: () =>
        this.safe(() => {
          this.engine.clearKv();
        }),
    };
  }

  private createHealthPort(): StorageHealth {
    return {
      portId: "storage-health",
      check: () => {
        const connected = this.isConnected();
        return createStorageResult({
          success: true,
          value: createStorageHealthStatus({
            healthy: connected,
            checkedAt: new Date().toISOString(),
            message: connected ? null : "SQLite connection is closed",
          }),
        });
      },
    };
  }

  private safe<T>(fn: () => T): StorageResult<T> {
    try {
      this.assertConnected();
      return createStorageResult({ success: true, value: fn() as T });
    } catch (error) {
      return createStorageResult({
        success: false,
        errorCode:
          error instanceof StorageUnavailableError
            ? "storage_unavailable"
            : "sqlite_error",
        message:
          error instanceof Error ? error.message : "SQLite operation failed",
      });
    }
  }

  private assertConnected(): void {
    if (!this.engine.isOpen()) {
      throw new StorageUnavailableError(
        this.name,
        "SQLite connection is closed",
      );
    }
  }
}
