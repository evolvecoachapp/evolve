import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealRemoval {
  readonly id: string;
  readonly mealKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
