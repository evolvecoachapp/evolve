import type { AggregationResult } from "./AggregationResult";
import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationPlan } from "./CollaborationPlan";
import type { CollaborationRequest } from "./CollaborationRequest";
import type { CollaborationStatus } from "./CollaborationStatus";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Immutable collaboration snapshot for Coach Agent consumption.
 */
export interface CollaborationSnapshot {
  readonly id: string;
  readonly collaborationId: string;
  readonly request: CollaborationRequest;
  readonly plan: CollaborationPlan | null;
  readonly results: readonly ExecutionResult[];
  readonly aggregation: AggregationResult | null;
  readonly status: CollaborationStatus;
  readonly participantCount: number;
  readonly taskCount: number;
  readonly resultCount: number;
  readonly metadata: CollaborationMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
