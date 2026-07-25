import type { NutritionMetadata } from "./NutritionMetadata";

export interface FatAdjustment {
  readonly id: string;
  readonly fatKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
