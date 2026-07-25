import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionHistoryEntry {
  readonly id: string;
  readonly adaptationId: string;
  readonly planId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface NutritionHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly NutritionHistoryEntry[];
  readonly historyKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
