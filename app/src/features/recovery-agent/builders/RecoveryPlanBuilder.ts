import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryPlanningResult } from "../models/RecoveryPlanningResult";
import type { RecoveryReasoning } from "../models/RecoveryReasoning";
import { PlannerSelector } from "../selectors/PlannerSelector";
import { createDefaultReasoners } from "../reasoning";

export class RecoveryPlanBuilder {
  constructor(private readonly plannerSelector = new PlannerSelector()) {}

  build(input: {
    readonly context: RecoveryContext;
    readonly reasoning?: readonly RecoveryReasoning[];
    readonly clock?: () => string;
  }): RecoveryPlanningResult {
    const clock = input.clock ?? (() => new Date().toISOString());
    const reasoning =
      input.reasoning ??
      createDefaultReasoners().map((r) => r.reason(input.context));
    const planner = this.plannerSelector.select(input.context);
    return planner.plan(input.context, reasoning, clock);
  }

  buildProposal(input: {
    readonly context: RecoveryContext;
    readonly reasoning?: readonly RecoveryReasoning[];
    readonly clock?: () => string;
  }): RecoveryPlan {
    return this.build(input).plan;
  }
}
