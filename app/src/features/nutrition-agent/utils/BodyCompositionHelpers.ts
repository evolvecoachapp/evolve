import type { NutritionGoal } from "../models/NutritionGoal";
import { NutritionGoals } from "../models/NutritionGoal";
import type { BodyCompositionState } from "../models/BodyCompositionState";
import type { NutritionPhaseHint } from "../models/NutritionPlan";

export function phaseForGoal(goal: NutritionGoal): NutritionPhaseHint {
  switch (goal) {
    case NutritionGoals.FAT_LOSS:
      return "cut";
    case NutritionGoals.MUSCLE_GAIN:
    case NutritionGoals.HYPERTROPHY:
      return "bulk";
    case NutritionGoals.CONTEST_PREP:
      return "contest";
    case NutritionGoals.MAINTENANCE:
    case NutritionGoals.GENERAL_HEALTH:
      return "maintain";
    case NutritionGoals.RECOMPOSITION:
      return "maintain";
    default:
      return "unknown";
  }
}

export function buildBodyCompositionState(
  goal: NutritionGoal,
): BodyCompositionState {
  return Object.freeze({
    phase: phaseForGoal(goal),
    estimatedBodyFatPercent: null,
    notes: Object.freeze([
      `Body-composition phase aligned to ${goal}.`,
    ]),
  });
}
