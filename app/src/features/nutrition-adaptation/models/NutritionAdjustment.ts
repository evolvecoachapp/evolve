import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionAdjustment {
  readonly id: string;
  readonly targetKey: string;
  readonly adjustmentKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
