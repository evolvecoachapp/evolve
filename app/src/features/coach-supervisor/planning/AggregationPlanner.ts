import { buildAggregationContext } from "../builders/AggregationBuilder";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { AggregationContext } from "../models/AggregationContext";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import { selectAggregationInputs } from "../selectors/AggregationSelector";

/**
 * Planning only — prepares aggregation context, never aggregates.
 */
export class AggregationPlanner {
  plan(input: {
    readonly id: string;
    readonly plan: CoordinationPlan;
    readonly summaries: readonly AgentExecutionSummary[];
    readonly createdAt: string;
  }): AggregationContext {
    return buildAggregationContext({
      id: input.id,
      plan: input.plan,
      summaries: selectAggregationInputs(input.summaries),
      createdAt: input.createdAt,
    });
  }
}

export function createAggregationPlanner(): AggregationPlanner {
  return new AggregationPlanner();
}
