/**
 * Immutable storage session descriptor.
 * Contract type only — no I/O.
 */
export type StorageSessionStatus = "open" | "committed" | "rolled_back";

export interface StorageSession {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly status: StorageSessionStatus;
}

export function createStorageSession(input: {
  readonly sessionId: string;
  readonly startedAt: string;
  readonly status?: StorageSessionStatus;
}): StorageSession {
  return Object.freeze({
    sessionId: input.sessionId,
    startedAt: input.startedAt,
    status: input.status ?? "open",
  });
}
