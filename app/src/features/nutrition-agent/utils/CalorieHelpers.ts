import type { NutritionGoal } from "../models/NutritionGoal";
import { NutritionGoals } from "../models/NutritionGoal";
import type { CalorieTargets } from "../models/CalorieTargets";

const ACTIVITY_MULTIPLIER: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function estimateTdee(input: {
  readonly bodyWeightKg: number;
  readonly activityLevel: string;
}): number {
  const bmr = 22 * input.bodyWeightKg;
  const mult = ACTIVITY_MULTIPLIER[input.activityLevel] ?? 1.55;
  return Math.round(bmr * mult);
}

export function calorieAdjustmentForGoal(goal: NutritionGoal): number {
  switch (goal) {
    case NutritionGoals.FAT_LOSS:
    case NutritionGoals.CONTEST_PREP:
      return -500;
    case NutritionGoals.MUSCLE_GAIN:
    case NutritionGoals.HYPERTROPHY:
      return 300;
    case NutritionGoals.RECOMPOSITION:
      return -150;
    case NutritionGoals.PERFORMANCE:
    case NutritionGoals.POWERLIFTING:
      return 200;
    default:
      return 0;
  }
}

export function buildCalorieTargets(input: {
  readonly bodyWeightKg: number;
  readonly activityLevel: string;
  readonly goal: NutritionGoal;
}): CalorieTargets {
  const tdeeEstimate = estimateTdee(input);
  const deficitOrSurplus = calorieAdjustmentForGoal(input.goal);
  const targetCalories = Math.max(1200, tdeeEstimate + deficitOrSurplus);
  return Object.freeze({ tdeeEstimate, targetCalories, deficitOrSurplus });
}

export function clampCalories(n: number): number {
  return Math.min(6000, Math.max(800, Math.round(n)));
}
