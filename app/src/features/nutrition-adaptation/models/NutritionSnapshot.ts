import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
