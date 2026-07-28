import type { SynchronizationOperation } from "./SynchronizationOperation";

/**
 * Immutable FIFO synchronization queue snapshot.
 */
export interface SynchronizationQueue {
  readonly queueId: string;
  readonly operations: readonly SynchronizationOperation[];
  readonly size: number;
}

export function createSynchronizationQueue(input: {
  readonly queueId: string;
  readonly operations?: readonly SynchronizationOperation[];
}): SynchronizationQueue {
  const operations = Object.freeze([...(input.operations ?? [])]);
  return Object.freeze({
    queueId: input.queueId,
    operations,
    size: operations.length,
  });
}
