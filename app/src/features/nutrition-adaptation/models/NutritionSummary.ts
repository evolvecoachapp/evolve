import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly decisionKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
