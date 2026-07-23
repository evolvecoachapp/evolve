import { buildAggregationContext } from "../builders/AggregationContextBuilder";
import type { AggregationContext } from "../models/AggregationContext";
import type { AggregationResult } from "../models/AggregationResult";
import type { ExecutionResult } from "../models/ExecutionResult";
import {
  createAggregationRulesPolicy,
  type AggregationRulesPolicy,
} from "../policies/AggregationRulesPolicy";
import { validateAggregationInputs } from "../validators/validateAggregationInputs";

export interface ResultAggregatorDeps {
  readonly aggregationPolicy?: AggregationRulesPolicy;
}

/**
 * Deterministically merges specialist execution outputs.
 *
 * Preserves ordering, provenance, and metadata.
 * No AI summarization, scoring, ranking, heuristics, or inference.
 */
export class ResultAggregator {
  private readonly aggregationPolicy: AggregationRulesPolicy;

  constructor(deps: ResultAggregatorDeps = {}) {
    this.aggregationPolicy =
      deps.aggregationPolicy ?? createAggregationRulesPolicy();
  }

  aggregateFromContext(input: {
    readonly context: AggregationContext;
    readonly aggregationId?: string;
    readonly clock: () => string;
  }): AggregationResult {
    const validation = validateAggregationInputs({ context: input.context });
    if (!validation.valid) {
      return this.aggregationPolicy.aggregate({
        id: input.aggregationId ?? `aggregation:${input.context.id}:invalid`,
        collaborationId: input.context.collaborationId,
        planId: input.context.planId,
        contextId: input.context.id,
        results: [],
        createdAt: input.clock(),
      });
    }

    return this.aggregationPolicy.aggregate({
      id: input.aggregationId ?? `aggregation:${input.context.id}`,
      collaborationId: input.context.collaborationId,
      planId: input.context.planId,
      contextId: input.context.id,
      results: input.context.results,
      createdAt: input.clock(),
    });
  }

  aggregate(input: {
    readonly collaborationId: string;
    readonly plan: AggregationContext["plan"];
    readonly results: readonly ExecutionResult[];
    readonly contextId?: string;
    readonly aggregationId?: string;
    readonly clock: () => string;
  }): AggregationResult {
    const now = input.clock();
    const context = buildAggregationContext({
      id: input.contextId ?? `agg-context:${input.collaborationId}`,
      collaborationId: input.collaborationId,
      plan: input.plan,
      results: input.results,
      createdAt: now,
    });
    return this.aggregateFromContext({
      context,
      aggregationId: input.aggregationId,
      clock: input.clock,
    });
  }
}

export function createResultAggregator(
  deps: ResultAggregatorDeps = {},
): ResultAggregator {
  return new ResultAggregator(deps);
}
