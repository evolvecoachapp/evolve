import type { NutritionMetadata } from "./NutritionMetadata";

export interface HydrationAdjustment {
  readonly id: string;
  readonly hydrationKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
