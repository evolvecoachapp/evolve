import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ActionStep } from "../models/ActionStep";
import type { ActionPlanner } from "./ActionPlanner";
import { GoalPlanner } from "./GoalPlanner";
import { NutritionPlanner } from "./NutritionPlanner";
import { RecoveryPlanner } from "./RecoveryPlanner";
import { ReminderPlanner } from "./ReminderPlanner";
import { WorkoutPlanner } from "./WorkoutPlanner";

/**
 * Composite planner — aggregates domain planners into ordered ActionSteps.
 * One responsibility: merge planner outputs deterministically.
 */
export class CompositePlanner implements ActionPlanner {
  readonly id = "planner:composite";

  constructor(
    private readonly planners: readonly ActionPlanner[] = Object.freeze([
      new WorkoutPlanner(),
      new NutritionPlanner(),
      new RecoveryPlanner(),
      new GoalPlanner(),
      new ReminderPlanner(),
    ]),
  ) {}

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const merged: ActionStep[] = [];
    let orderOffset = 0;

    for (const planner of this.planners) {
      const steps = planner.plan(response, planId);
      for (const step of steps) {
        merged.push(
          Object.freeze({
            ...step,
            order: orderOffset + step.order,
          }),
        );
      }
      orderOffset += steps.length;
    }

    return Object.freeze(merged);
  }
}
