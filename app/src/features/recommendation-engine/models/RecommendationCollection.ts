import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { RecommendationMetadata } from "./RecommendationMetadata";

export interface RecommendationCollection {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly items: readonly CoachingRecommendation[];
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}
