import type { NutritionMetadata } from "./NutritionMetadata";

export interface FiberAdjustment {
  readonly id: string;
  readonly fiberKey: string;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
