import type { SynchronizationMetadata } from "./SynchronizationMetadata";
import { createSynchronizationMetadata } from "./SynchronizationMetadata";
import type { SynchronizationState } from "./SynchronizationState";

/**
 * Immutable synchronization checkpoint snapshot.
 */
export interface SynchronizationCheckpoint {
  readonly checkpointId: string;
  readonly sequence: number;
  readonly state: SynchronizationState;
  readonly createdAt: string;
  readonly metadata: SynchronizationMetadata;
}

export function createSynchronizationCheckpoint(input: {
  readonly checkpointId: string;
  readonly sequence: number;
  readonly state: SynchronizationState;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): SynchronizationCheckpoint {
  return Object.freeze({
    checkpointId: input.checkpointId,
    sequence: input.sequence,
    state: input.state,
    createdAt: input.createdAt,
    metadata: createSynchronizationMetadata(input.metadata ?? {}),
  });
}
