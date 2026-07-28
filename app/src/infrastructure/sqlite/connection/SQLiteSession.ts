import type { StorageSession, StorageSessionStatus } from "../../../core/persistence/ports/StorageSession";

/**
 * SQLite-backed storage session descriptor.
 * No domain logic.
 */
export interface SQLiteSession extends StorageSession {
  readonly backendId: "sqlite";
}

export function createSQLiteSession(input: {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly status?: StorageSessionStatus;
}): SQLiteSession {
  return Object.freeze({
    sessionId: input.sessionId,
    startedAt: input.startedAt,
    status: input.status ?? "open",
    backendId: "sqlite" as const,
  });
}

export function withSQLiteSessionStatus(
  session: SQLiteSession,
  status: StorageSessionStatus,
): SQLiteSession {
  return Object.freeze({
    ...session,
    status,
  });
}
