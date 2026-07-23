import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionPlan } from "../models/NutritionPlan";
import type { NutritionPlanningResult } from "../models/NutritionPlanningResult";
import type { NutritionReasoning } from "../models/NutritionReasoning";
import { PlannerSelector } from "../selectors/PlannerSelector";
import { createDefaultReasoners } from "../reasoning";

export class NutritionPlanBuilder {
  constructor(private readonly plannerSelector = new PlannerSelector()) {}

  build(input: {
    readonly context: NutritionContext;
    readonly reasoning?: readonly NutritionReasoning[];
    readonly clock?: () => string;
  }): NutritionPlanningResult {
    const clock = input.clock ?? (() => new Date().toISOString());
    const reasoning =
      input.reasoning ??
      createDefaultReasoners().map((r) => r.reason(input.context));
    const planner = this.plannerSelector.select(input.context);
    return planner.plan(input.context, reasoning, clock);
  }

  buildProposal(input: {
    readonly context: NutritionContext;
    readonly reasoning?: readonly NutritionReasoning[];
    readonly clock?: () => string;
  }): NutritionPlan {
    return this.build(input).plan;
  }
}
