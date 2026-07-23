import type { WorkoutIntent } from "../models/WorkoutIntent";
import { WorkoutIntents } from "../models/WorkoutIntent";

export class IntentSelector {
  select(input: {
    readonly intentHint: WorkoutIntent | null;
    readonly message: string;
  }): WorkoutIntent {
    if (input.intentHint) return input.intentHint;
    const text = input.message.toLowerCase();
    if (/progress|overload|increase/.test(text)) {
      return WorkoutIntents.ADJUST_PROGRESSION;
    }
    if (/exercise|lift selection|swap/.test(text)) {
      return WorkoutIntents.SELECT_EXERCISES;
    }
    if (/split|upper.?lower|ppl|full.?body/.test(text)) {
      return WorkoutIntents.DESIGN_SPLIT;
    }
    if (/evaluat|review|check plan/.test(text)) {
      return WorkoutIntents.EVALUATE_PLAN;
    }
    if (/recover|deload/.test(text)) {
      return WorkoutIntents.RECOVERY_ADVICE;
    }
    if (/plan|program|workout|train/.test(text)) {
      return WorkoutIntents.PLAN_WORKOUT;
    }
    return WorkoutIntents.GENERAL_TRAINING;
  }
}
