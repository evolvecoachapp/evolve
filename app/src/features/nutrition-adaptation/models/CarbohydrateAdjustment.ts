import type { NutritionMetadata } from "./NutritionMetadata";

export interface CarbohydrateAdjustment {
  readonly id: string;
  readonly carbohydrateKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
