import type { AggregationResult } from "../models/AggregationResult";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import { CollaborationPolicyKinds } from "../models/CollaborationPolicy";
import type { ExecutionResult } from "../models/ExecutionResult";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { freezeAggregationResult } from "../utils/FreezeCollaborationState";
import { sortResultsDeterministic } from "../utils/sortHelpers";

/**
 * Aggregation rules policy — ordered merge preserving provenance.
 * Contains NO AI, scoring, ranking, or heuristics.
 */
export interface AggregationRulesPolicy {
  readonly policy: CollaborationPolicy;
  aggregate(input: {
    readonly id: string;
    readonly collaborationId: string;
    readonly planId: string;
    readonly contextId: string;
    readonly results: readonly ExecutionResult[];
    readonly createdAt: string;
  }): AggregationResult;
}

export class DefaultAggregationRulesPolicy implements AggregationRulesPolicy {
  readonly policy: CollaborationPolicy = Object.freeze({
    id: "policy:collaboration:aggregation-rules:default",
    kind: CollaborationPolicyKinds.AGGREGATION_RULES,
    name: "Default Aggregation Rules",
    description:
      "Merges execution results in deterministic order; preserves provenance and metadata.",
    enabled: true,
  });

  aggregate(input: {
    readonly id: string;
    readonly collaborationId: string;
    readonly planId: string;
    readonly contextId: string;
    readonly results: readonly ExecutionResult[];
    readonly createdAt: string;
  }): AggregationResult {
    const results = sortResultsDeterministic(input.results);
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    const orderedAgentIds = Object.freeze(results.map((r) => r.agentId));
    const provenance = Object.freeze(
      results.map(
        (r) =>
          `${r.order}:${r.agentId}:${r.taskId}:${r.success ? "ok" : "fail"}`,
      ),
    );

    return freezeAggregationResult({
      id: input.id,
      collaborationId: input.collaborationId,
      planId: input.planId,
      contextId: input.contextId,
      success: failureCount === 0 && results.length > 0,
      message:
        results.length === 0
          ? "No execution results to aggregate."
          : failureCount === 0
            ? `Aggregated ${results.length} specialist result(s).`
            : `Aggregated ${results.length} result(s) with ${failureCount} failure(s).`,
      results,
      resultCount: results.length,
      successCount,
      failureCount,
      orderedAgentIds,
      provenance,
      metadata: EMPTY_COLLABORATION_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.createdAt,
    });
  }
}

export function createAggregationRulesPolicy(): AggregationRulesPolicy {
  return new DefaultAggregationRulesPolicy();
}
