import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";
import type { WorkoutContext } from "../models/WorkoutContext";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutPlanningResult } from "../models/WorkoutPlanningResult";
import type { WorkoutReasoning } from "../models/WorkoutReasoning";
import { PlannerSelector } from "../selectors/PlannerSelector";
import { createDefaultReasoners } from "../reasoning";

export class WorkoutPlanBuilder {
  constructor(private readonly plannerSelector = new PlannerSelector()) {}

  build(input: {
    readonly context: WorkoutContext;
    readonly reasoning?: readonly WorkoutReasoning[];
    readonly clock?: () => string;
  }): WorkoutPlanningResult {
    const clock = input.clock ?? (() => new Date().toISOString());
    const reasoning =
      input.reasoning ??
      createDefaultReasoners().map((r) => r.reason(input.context));
    const planner = this.plannerSelector.select(input.context);
    return planner.plan(input.context, reasoning, clock);
  }

  buildProposal(input: {
    readonly context: WorkoutContext;
    readonly reasoning?: readonly WorkoutReasoning[];
    readonly clock?: () => string;
  }): WorkoutPlanProposal {
    return this.build(input).proposal;
  }
}

export { EMPTY_WORKOUT_AGENT_METADATA };
