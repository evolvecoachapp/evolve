/**
 * Immutable storage health status descriptor.
 * Contract type only — no I/O.
 */
export interface StorageHealthStatus {
  readonly healthy: boolean;
  readonly checkedAt: string;
  readonly message: string | null;
}

export function createStorageHealthStatus(input: {
  readonly healthy: boolean;
  readonly checkedAt: string;
  readonly message?: string | null;
}): StorageHealthStatus {
  return Object.freeze({
    healthy: input.healthy,
    checkedAt: input.checkedAt,
    message: input.message ?? null,
  });
}
