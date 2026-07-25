import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendationCount: number;
  readonly groupCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly topCategory: string | null;
  readonly focusAreas: readonly string[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
