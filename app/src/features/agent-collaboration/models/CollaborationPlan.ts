import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationParticipant } from "./CollaborationParticipant";
import type { CollaborationPolicy } from "./CollaborationPolicy";
import type { CollaborationStatus } from "./CollaborationStatus";
import type { CollaborationTask } from "./CollaborationTask";
import type { ExecutionBatch } from "./ExecutionBatch";

/**
 * Immutable executable collaboration plan.
 *
 * Planning NEVER executes — this is a frozen schedule only.
 */
export interface CollaborationPlan {
  readonly id: string;
  readonly requestId: string;
  readonly collaborationId: string;
  readonly participants: readonly CollaborationParticipant[];
  readonly tasks: readonly CollaborationTask[];
  readonly batches: readonly ExecutionBatch[];
  readonly policies: readonly CollaborationPolicy[];
  readonly status: CollaborationStatus;
  readonly metadata: CollaborationMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
