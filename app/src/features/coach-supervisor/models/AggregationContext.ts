import type { AgentExecutionSummary } from "./AgentExecutionSummary";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoordinationPlan } from "./CoordinationPlan";

/**
 * Immutable aggregation input context.
 */
export interface AggregationContext {
  readonly id: string;
  readonly planId: string;
  readonly plan: CoordinationPlan;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
