import type { AggregationResult } from "../models/AggregationResult";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationSnapshot } from "../models/CollaborationSnapshot";
import type { CollaborationStatus } from "../models/CollaborationStatus";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import {
  EMPTY_COLLABORATION_METADATA,
  type CollaborationMetadata,
} from "../models/CollaborationMetadata";
import type { ExecutionResult } from "../models/ExecutionResult";
import { freezeSnapshot } from "../utils/FreezeCollaborationState";
import { sortResultsDeterministic } from "../utils/sortHelpers";

export interface CollaborationSnapshotBuilderInput {
  readonly id: string;
  readonly collaborationId: string;
  readonly request: CollaborationRequest;
  readonly plan?: CollaborationPlan | null;
  readonly results?: readonly ExecutionResult[];
  readonly aggregation?: AggregationResult | null;
  readonly status?: CollaborationStatus;
  readonly metadata?: CollaborationMetadata;
  readonly createdAt: string;
}

/**
 * Builds an immutable CollaborationSnapshot for Coach Agent consumption.
 */
export class CollaborationSnapshotBuilder {
  build(input: CollaborationSnapshotBuilderInput): CollaborationSnapshot {
    const now = input.createdAt;
    const plan = input.plan ?? null;
    const results = sortResultsDeterministic(input.results ?? []);
    const aggregation = input.aggregation ?? null;

    return freezeSnapshot({
      id: input.id,
      collaborationId: input.collaborationId,
      request: input.request,
      plan,
      results,
      aggregation,
      status: input.status ?? CollaborationStatuses.COMPLETED,
      participantCount: plan?.participants.length ?? 0,
      taskCount: plan?.tasks.length ?? 0,
      resultCount: results.length,
      metadata: input.metadata ?? EMPTY_COLLABORATION_METADATA,
      createdAt: now,
      frozenAt: now,
    });
  }
}

export function buildCollaborationSnapshotFromInput(
  input: CollaborationSnapshotBuilderInput,
): CollaborationSnapshot {
  return new CollaborationSnapshotBuilder().build(input);
}
