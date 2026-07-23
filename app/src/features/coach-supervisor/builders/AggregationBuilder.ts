import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { AggregationContext } from "../models/AggregationContext";
import type { AggregationResult } from "../models/AggregationResult";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import { EMPTY_SUPERVISOR_DIAGNOSTICS } from "../models/SupervisorDiagnostics";
import {
  collectProvenance,
  countByStatus,
} from "../utils/AggregationHelpers";
import {
  freezeAggregationContext,
  freezeAggregationResult,
} from "../utils/FreezeSupervisorState";

export function buildAggregationContext(input: {
  readonly id: string;
  readonly plan: CoordinationPlan;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly createdAt: string;
}): AggregationContext {
  return freezeAggregationContext({
    id: input.id,
    planId: input.plan.id,
    plan: input.plan,
    summaries: Object.freeze([...input.summaries]),
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}

export function buildAggregationResult(input: {
  readonly id: string;
  readonly context: AggregationContext;
  readonly explanations?: readonly string[];
  readonly conflicts?: readonly string[];
  readonly createdAt: string;
}): AggregationResult {
  const counts = countByStatus(input.context.summaries);
  const success = counts.failureCount === 0 && input.context.summaries.length > 0;
  return freezeAggregationResult({
    id: input.id,
    contextId: input.context.id,
    planId: input.context.planId,
    success,
    message: success
      ? "Aggregation completed."
      : "Aggregation completed with failures or empty results.",
    summaries: Object.freeze([...input.context.summaries]),
    orderedAgentIds: Object.freeze([
      ...input.context.plan.orderedAgentIds,
    ]),
    provenance: collectProvenance(input.context.summaries),
    explanations: Object.freeze([...(input.explanations ?? [])]),
    conflicts: Object.freeze([...(input.conflicts ?? [])]),
    diagnostics: Object.freeze({
      ...EMPTY_SUPERVISOR_DIAGNOSTICS,
      id: `diag:${input.id}`,
      notes: Object.freeze([
        `success=${counts.successCount}`,
        `failure=${counts.failureCount}`,
      ]),
      createdAt: input.createdAt,
    }),
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
