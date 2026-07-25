import type { NutritionMetadata } from "./NutritionMetadata";

export interface DietBreakAdjustment {
  readonly id: string;
  readonly dietBreakKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
