import type { StorageResult } from "../../../core/persistence/ports/StorageResult";
import type { SQLiteConnection } from "../connection/SQLiteConnection";
import type { SQLiteSession } from "../connection/SQLiteSession";
import type { SQLiteTransaction } from "../connection/SQLiteTransaction";

/**
 * Transaction helpers — begin / commit / rollback only.
 * No retry logic.
 */
export function begin(
  connection: SQLiteConnection,
): StorageResult<SQLiteSession> {
  return connection.transactions.begin();
}

export function commit(
  connection: SQLiteConnection,
  session: SQLiteSession,
): StorageResult<void> {
  return connection.transactions.commit(session);
}

export function rollback(
  connection: SQLiteConnection,
  session: SQLiteSession,
): StorageResult<void> {
  return connection.transactions.rollback(session);
}

export function getTransactionPort(
  connection: SQLiteConnection,
): SQLiteTransaction {
  return connection.transactions;
}
