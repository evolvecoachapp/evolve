import {
  EMPTY_COLLABORATION_METADATA,
  type CollaborationMetadata,
} from "../models/CollaborationMetadata";
import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import type { CollaborationTask } from "../models/CollaborationTask";
import type { ExecutionBatch } from "../models/ExecutionBatch";
import { freezePlan } from "../utils/FreezeCollaborationState";
import {
  sortBatchesDeterministic,
  sortParticipantsDeterministic,
  sortTasksDeterministic,
} from "../utils/sortHelpers";

export interface CollaborationPlanBuilderInput {
  readonly id: string;
  readonly requestId: string;
  readonly collaborationId: string;
  readonly participants: readonly CollaborationParticipant[];
  readonly tasks: readonly CollaborationTask[];
  readonly batches: readonly ExecutionBatch[];
  readonly policies?: readonly CollaborationPolicy[];
  readonly metadata?: CollaborationMetadata;
  readonly createdAt: string;
}

/**
 * Builds an immutable CollaborationPlan.
 */
export class CollaborationPlanBuilder {
  build(input: CollaborationPlanBuilderInput): CollaborationPlan {
    const now = input.createdAt;
    return freezePlan({
      id: input.id,
      requestId: input.requestId,
      collaborationId: input.collaborationId,
      participants: sortParticipantsDeterministic(input.participants),
      tasks: sortTasksDeterministic(input.tasks),
      batches: sortBatchesDeterministic(input.batches),
      policies: Object.freeze([...(input.policies ?? [])]),
      status: CollaborationStatuses.PLANNING,
      metadata: input.metadata ?? EMPTY_COLLABORATION_METADATA,
      createdAt: now,
      frozenAt: now,
    });
  }
}

export function buildCollaborationPlan(
  input: CollaborationPlanBuilderInput,
): CollaborationPlan {
  return new CollaborationPlanBuilder().build(input);
}
