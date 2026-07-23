import type { NutritionGoal } from "../models/NutritionGoal";
import { NutritionGoals } from "../models/NutritionGoal";
import type { NutritionIntent } from "../models/NutritionIntent";

export class GoalSelector {
  select(input: {
    readonly goalHint: NutritionGoal | null;
    readonly intent: NutritionIntent;
    readonly message: string;
  }): NutritionGoal {
    if (input.goalHint && input.goalHint !== NutritionGoals.UNKNOWN) {
      return input.goalHint;
    }
    const msg = input.message.toLowerCase();
    if (msg.includes("cut") || msg.includes("fat loss") || msg.includes("deficit"))
      return NutritionGoals.FAT_LOSS;
    if (msg.includes("bulk") || msg.includes("muscle gain") || msg.includes("surplus"))
      return NutritionGoals.MUSCLE_GAIN;
    if (msg.includes("recomp")) return NutritionGoals.RECOMPOSITION;
    if (msg.includes("contest")) return NutritionGoals.CONTEST_PREP;
    if (msg.includes("powerlift")) return NutritionGoals.POWERLIFTING;
    if (msg.includes("hypertroph")) return NutritionGoals.HYPERTROPHY;
    if (msg.includes("performance")) return NutritionGoals.PERFORMANCE;
    if (msg.includes("maintain")) return NutritionGoals.MAINTENANCE;
    if (input.intent === "body_composition") return NutritionGoals.RECOMPOSITION;
    return NutritionGoals.GENERAL_HEALTH;
  }
}
