import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSnapshot } from "../utils/FreezeRecommendationState";

export function buildRecommendationSnapshot(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly summary: RecommendationSummary | null;
  readonly at: string;
}): RecommendationSnapshot {
  return freezeSnapshot({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendations: input.recommendations,
    summary: input.summary,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
