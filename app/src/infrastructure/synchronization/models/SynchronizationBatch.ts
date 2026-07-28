import type { SynchronizationMetadata } from "./SynchronizationMetadata";
import { createSynchronizationMetadata } from "./SynchronizationMetadata";
import type { SynchronizationState } from "./SynchronizationState";

/**
 * Immutable synchronization batch of operation identifiers.
 */
export interface SynchronizationBatch {
  readonly batchId: string;
  readonly operationIds: readonly string[];
  readonly state: SynchronizationState;
  readonly createdAt: string;
  readonly metadata: SynchronizationMetadata;
}

export function createSynchronizationBatch(input: {
  readonly batchId: string;
  readonly operationIds?: readonly string[];
  readonly state?: SynchronizationState;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): SynchronizationBatch {
  return Object.freeze({
    batchId: input.batchId,
    operationIds: Object.freeze([...(input.operationIds ?? [])]),
    state: input.state ?? "pending",
    createdAt: input.createdAt,
    metadata: createSynchronizationMetadata(input.metadata ?? {}),
  });
}
