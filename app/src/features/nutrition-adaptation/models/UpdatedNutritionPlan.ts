import type { NutritionMetadata } from "./NutritionMetadata";

/** Structure keys only — NOT full nutrition generation. */
export interface UpdatedNutritionPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
