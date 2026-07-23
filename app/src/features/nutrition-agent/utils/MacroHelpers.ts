import type { NutritionGoal } from "../models/NutritionGoal";
import { NutritionGoals } from "../models/NutritionGoal";
import type { MacroTargets } from "../models/MacroTargets";

export function proteinPerKg(goal: NutritionGoal): number {
  switch (goal) {
    case NutritionGoals.FAT_LOSS:
    case NutritionGoals.CONTEST_PREP:
    case NutritionGoals.RECOMPOSITION:
      return 2.0;
    case NutritionGoals.MUSCLE_GAIN:
    case NutritionGoals.HYPERTROPHY:
    case NutritionGoals.POWERLIFTING:
      return 1.8;
    case NutritionGoals.PERFORMANCE:
      return 1.6;
    default:
      return 1.4;
  }
}

export function buildMacroTargets(input: {
  readonly bodyWeightKg: number;
  readonly targetCalories: number;
  readonly goal: NutritionGoal;
}): MacroTargets {
  const proteinG = Math.round(input.bodyWeightKg * proteinPerKg(input.goal));
  const fatG = Math.round(
    Math.max(0.6 * input.bodyWeightKg, (input.targetCalories * 0.25) / 9),
  );
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbsG = Math.max(
    50,
    Math.round((input.targetCalories - proteinCals - fatCals) / 4),
  );
  const fiberG =
    input.goal === NutritionGoals.GENERAL_HEALTH ||
    input.goal === NutritionGoals.FAT_LOSS
      ? 30
      : 25;
  return Object.freeze({
    calories: input.targetCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
  });
}

export function macroCalories(macros: MacroTargets): number {
  return macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9;
}
