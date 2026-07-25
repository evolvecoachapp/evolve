import type { NutritionMetadata } from "./NutritionMetadata";

export interface ProteinAdjustment {
  readonly id: string;
  readonly proteinKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
