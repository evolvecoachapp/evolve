import type { NutritionMetadata } from "./NutritionMetadata";

export interface MealTimingAdjustment {
  readonly id: string;
  readonly timingKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
