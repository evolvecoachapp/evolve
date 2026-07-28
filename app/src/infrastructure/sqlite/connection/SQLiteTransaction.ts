import {
  createStorageResult,
  type StorageResult,
} from "../../../core/persistence/ports/StorageResult";
import type { StorageTransaction } from "../../../core/persistence/ports/StorageTransaction";
import { TransactionFailureError } from "../../../core/persistence/errors";
import type { SQLiteEngine } from "./SQLiteEngine";
import {
  createSQLiteSession,
  withSQLiteSessionStatus,
  type SQLiteSession,
} from "./SQLiteSession";

let sessionCounter = 0;

function nextSessionId(): string {
  sessionCounter += 1;
  return `sqlite-session-${sessionCounter}`;
}

/**
 * SQLite transaction port — begin / commit / rollback only.
 * No retry logic. No domain logic.
 */
export class SQLiteTransaction implements StorageTransaction {
  readonly portId = "storage-transaction" as const;

  private active: SQLiteSession | null = null;

  constructor(private readonly engine: SQLiteEngine) {}

  begin(): StorageResult<SQLiteSession> {
    try {
      if (!this.engine.isOpen()) {
        return createStorageResult({
          success: false,
          errorCode: "storage_unavailable",
          message: "SQLite connection is closed",
        });
      }
      if (this.active !== null && this.active.status === "open") {
        return createStorageResult({
          success: false,
          errorCode: "transaction_failure",
          message: "Transaction already open",
        });
      }
      this.engine.beginTransaction();
      this.active = createSQLiteSession({
        sessionId: nextSessionId(),
        startedAt: new Date().toISOString(),
        status: "open",
      });
      return createStorageResult({ success: true, value: this.active });
    } catch (error) {
      return createStorageResult({
        success: false,
        errorCode: "transaction_failure",
        message: error instanceof Error ? error.message : "begin failed",
      });
    }
  }

  commit(session: SQLiteSession): StorageResult<void> {
    try {
      this.assertActiveSession(session);
      this.engine.commitTransaction();
      this.active = withSQLiteSessionStatus(session, "committed");
      return createStorageResult({ success: true, value: undefined });
    } catch (error) {
      return createStorageResult({
        success: false,
        errorCode: "transaction_failure",
        message: error instanceof Error ? error.message : "commit failed",
      });
    }
  }

  rollback(session: SQLiteSession): StorageResult<void> {
    try {
      this.assertActiveSession(session);
      this.engine.rollbackTransaction();
      this.active = withSQLiteSessionStatus(session, "rolled_back");
      return createStorageResult({ success: true, value: undefined });
    } catch (error) {
      return createStorageResult({
        success: false,
        errorCode: "transaction_failure",
        message: error instanceof Error ? error.message : "rollback failed",
      });
    }
  }

  getActiveSession(): SQLiteSession | null {
    return this.active;
  }

  private assertActiveSession(session: SQLiteSession): void {
    if (!this.active || this.active.sessionId !== session.sessionId) {
      throw new TransactionFailureError(
        session.sessionId,
        "Invalid transaction session",
      );
    }
    if (this.active.status !== "open") {
      throw new TransactionFailureError(
        session.sessionId,
        `Transaction is ${this.active.status}`,
      );
    }
  }
}
