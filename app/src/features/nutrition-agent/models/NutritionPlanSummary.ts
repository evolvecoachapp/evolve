import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionPhaseHint } from "./NutritionPlan";

/**
 * Immutable lightweight summary of a nutrition plan proposal.
 */
export interface NutritionPlanSummary {
  readonly planId: string;
  readonly goal: NutritionGoal;
  readonly phaseHint: NutritionPhaseHint;
  readonly targetCalories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly mealCount: number;
  readonly summary: string;
  readonly createdAt: string;
}
