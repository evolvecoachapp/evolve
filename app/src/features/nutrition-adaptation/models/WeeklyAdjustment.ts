import type { NutritionMetadata } from "./NutritionMetadata";

export interface WeeklyAdjustment {
  readonly id: string;
  readonly weekKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
