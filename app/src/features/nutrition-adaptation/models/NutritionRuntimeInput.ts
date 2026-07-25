import type { NutritionMetadata } from "./NutritionMetadata";

/** Handoff to Nutrition Runtime — structural keys only. */
export interface NutritionRuntimeInput {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly updatedPlanId: string;
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
