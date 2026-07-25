import type { NutritionMetadata } from "./NutritionMetadata";

export interface CalorieAdjustment {
  readonly id: string;
  readonly calorieKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
