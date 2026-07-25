import type { NutritionMetadata } from "./NutritionMetadata";

export interface NutritionTimelineItem {
  readonly id: string;
  readonly adaptationId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface NutritionTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly NutritionTimelineItem[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}
