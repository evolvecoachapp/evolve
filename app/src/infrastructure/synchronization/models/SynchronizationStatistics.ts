/**
 * Immutable synchronization statistics snapshot.
 */
export interface SynchronizationStatistics {
  readonly pendingCount: number;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly cancelledCount: number;
  readonly conflictCount: number;
  readonly batchCount: number;
  readonly lastCheckpointId: string | null;
}

export function createSynchronizationStatistics(
  input: Partial<SynchronizationStatistics> = {},
): SynchronizationStatistics {
  return Object.freeze({
    pendingCount: input.pendingCount ?? 0,
    completedCount: input.completedCount ?? 0,
    failedCount: input.failedCount ?? 0,
    cancelledCount: input.cancelledCount ?? 0,
    conflictCount: input.conflictCount ?? 0,
    batchCount: input.batchCount ?? 0,
    lastCheckpointId: input.lastCheckpointId ?? null,
  });
}
