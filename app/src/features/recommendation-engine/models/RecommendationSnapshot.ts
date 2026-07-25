import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationSummary } from "./RecommendationSummary";

export interface RecommendationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly summary: RecommendationSummary | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
