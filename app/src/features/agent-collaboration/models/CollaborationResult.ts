import type { AggregationResult } from "./AggregationResult";
import type { CollaborationEvent } from "./CollaborationEvent";
import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationPlan } from "./CollaborationPlan";
import type { CollaborationSnapshot } from "./CollaborationSnapshot";
import type { CollaborationStatus } from "./CollaborationStatus";
import type { CollaborationValidation } from "./CollaborationValidation";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Operation kinds returned by Agent Collaboration.
 */
export const CollaborationOperationKinds = {
  PLAN: "plan",
  DISPATCH: "dispatch",
  EXECUTE: "execute",
  AGGREGATE: "aggregate",
  SNAPSHOT: "snapshot",
} as const;

export type CollaborationOperationKind =
  (typeof CollaborationOperationKinds)[keyof typeof CollaborationOperationKinds];

/**
 * Immutable primary output of Agent Collaboration orchestration.
 */
export interface CollaborationResult {
  readonly id: string;
  readonly collaborationId: string;
  readonly operation: CollaborationOperationKind;
  readonly success: boolean;
  readonly status: CollaborationStatus;
  readonly message: string | null;
  readonly plan: CollaborationPlan | null;
  readonly results: readonly ExecutionResult[];
  readonly aggregation: AggregationResult | null;
  readonly snapshot: CollaborationSnapshot | null;
  readonly validation: CollaborationValidation;
  readonly events: readonly CollaborationEvent[];
  readonly metadata: CollaborationMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
