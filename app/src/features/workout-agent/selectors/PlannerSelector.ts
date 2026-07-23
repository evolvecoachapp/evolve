import type { WorkoutPlanner } from "../planning";
import {
  AccessoryPlanner,
  DeloadPlanner,
  ExercisePlanner,
  ProgressionPlanner,
  RecoveryPlanner,
  SplitPlanner,
  WorkoutPlannerImpl,
} from "../planning";
import type { WorkoutContext } from "../models/WorkoutContext";
import { WorkoutIntents } from "../models/WorkoutIntent";

export class PlannerSelector {
  select(context: WorkoutContext): WorkoutPlanner {
    if (
      context.objective === "recovery" ||
      context.intent === WorkoutIntents.RECOVERY_ADVICE ||
      context.constraints.includes("needs_recovery")
    ) {
      return new RecoveryPlanner();
    }
    if (context.intent === WorkoutIntents.ADJUST_PROGRESSION) {
      return new ProgressionPlanner();
    }
    if (context.intent === WorkoutIntents.SELECT_EXERCISES) {
      return new ExercisePlanner();
    }
    if (context.intent === WorkoutIntents.DESIGN_SPLIT) {
      return new SplitPlanner();
    }
    if (context.constraints.includes("focus_accessories")) {
      return new AccessoryPlanner();
    }
    if (context.constraints.includes("force_deload")) {
      return new DeloadPlanner();
    }
    return new WorkoutPlannerImpl();
  }
}
