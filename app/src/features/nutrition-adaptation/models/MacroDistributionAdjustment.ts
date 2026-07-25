import type { NutritionMetadata } from "./NutritionMetadata";

export interface MacroDistributionAdjustment {
  readonly id: string;
  readonly macroKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
