import type { NutritionMetadata } from "./NutritionMetadata";

export interface SupplementAdjustment {
  readonly id: string;
  readonly supplementKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
