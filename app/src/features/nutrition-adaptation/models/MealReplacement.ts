import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealReplacement {
  readonly id: string;
  readonly fromMealKey: string;
  readonly toMealKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
