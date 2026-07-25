import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionReplacement {
  readonly id: string;
  readonly fromKey: string;
  readonly toKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
