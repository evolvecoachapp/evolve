import type { CollaborationPlan } from "../models/CollaborationPlan";
import {
  EMPTY_COLLABORATION_METADATA,
  type CollaborationMetadata,
} from "../models/CollaborationMetadata";
import type { AggregationContext } from "../models/AggregationContext";
import type { ExecutionResult } from "../models/ExecutionResult";
import { freezeAggregationContext } from "../utils/FreezeCollaborationState";
import { sortResultsDeterministic } from "../utils/sortHelpers";

export interface AggregationContextBuilderInput {
  readonly id: string;
  readonly collaborationId: string;
  readonly plan: CollaborationPlan;
  readonly results: readonly ExecutionResult[];
  readonly metadata?: CollaborationMetadata;
  readonly createdAt: string;
}

/**
 * Builds an immutable AggregationContext preserving order + provenance.
 */
export class AggregationContextBuilder {
  build(input: AggregationContextBuilderInput): AggregationContext {
    const now = input.createdAt;
    return freezeAggregationContext({
      id: input.id,
      collaborationId: input.collaborationId,
      planId: input.plan.id,
      plan: input.plan,
      results: sortResultsDeterministic(input.results),
      metadata: input.metadata ?? EMPTY_COLLABORATION_METADATA,
      createdAt: now,
      frozenAt: now,
    });
  }
}

export function buildAggregationContext(
  input: AggregationContextBuilderInput,
): AggregationContext {
  return new AggregationContextBuilder().build(input);
}
