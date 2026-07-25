import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealAdjustment {
  readonly id: string;
  readonly mealKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
