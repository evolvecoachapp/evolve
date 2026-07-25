import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealInsertion {
  readonly id: string;
  readonly mealKey: string;
  readonly afterKey: string | null;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
