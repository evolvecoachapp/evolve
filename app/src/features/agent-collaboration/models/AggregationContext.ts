import type { CollaborationMetadata } from "./CollaborationMetadata";
import type { CollaborationPlan } from "./CollaborationPlan";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Immutable aggregation input context.
 *
 * Holds ordered execution results with plan provenance for deterministic merge.
 */
export interface AggregationContext {
  readonly id: string;
  readonly collaborationId: string;
  readonly planId: string;
  readonly plan: CollaborationPlan;
  readonly results: readonly ExecutionResult[];
  readonly metadata: CollaborationMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
