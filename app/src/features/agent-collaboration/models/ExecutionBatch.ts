import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationStatus } from "./CollaborationStatus";

/**
 * Immutable ordered batch of collaboration tasks.
 *
 * Batches execute sequentially; tasks within a batch also execute sequentially.
 */
export interface ExecutionBatch {
  readonly id: string;
  readonly planId: string;
  readonly order: number;
  readonly taskIds: readonly string[];
  readonly status: CollaborationStatus;
  readonly metadata: CollaborationMetadata;
}
