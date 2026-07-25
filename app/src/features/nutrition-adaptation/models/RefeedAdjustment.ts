import type { NutritionMetadata } from "./NutritionMetadata";

export interface RefeedAdjustment {
  readonly id: string;
  readonly refeedKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
