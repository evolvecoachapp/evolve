import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ActionPlanner } from "../planners/ActionPlanner";
import { CompositePlanner } from "../planners/CompositePlanner";
import { GoalPlanner } from "../planners/GoalPlanner";
import { NutritionPlanner } from "../planners/NutritionPlanner";
import { RecoveryPlanner } from "../planners/RecoveryPlanner";
import { ReminderPlanner } from "../planners/ReminderPlanner";
import { WorkoutPlanner } from "../planners/WorkoutPlanner";

/**
 * Deterministic planner selection based on CoachResponse contents.
 */
export class PlannerSelector {
  select(response: CoachResponse): readonly ActionPlanner[] {
    const planners: ActionPlanner[] = [];

    if (response.exercises.length > 0 ||
      response.actions.some((a) => a.kind === "start_workout")) {
      planners.push(new WorkoutPlanner());
    }
    if (response.nutrition.length > 0) {
      planners.push(new NutritionPlanner());
    }
    if (response.recovery.length > 0) {
      planners.push(new RecoveryPlanner());
    }
    if (response.recommendations.length > 0) {
      planners.push(new GoalPlanner());
    }
    if (response.questions.length > 0) {
      planners.push(new ReminderPlanner());
    }

    if (planners.length === 0) {
      return Object.freeze([new CompositePlanner([])]);
    }

    return Object.freeze(planners);
  }

  selectComposite(response: CoachResponse): ActionPlanner {
    return new CompositePlanner(this.select(response));
  }
}
