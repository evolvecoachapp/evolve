import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSummary } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

export function buildRecommendationSummary(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly groupCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly focusAreas: readonly string[];
  readonly at: string;
}): RecommendationSummary {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezeSummary({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    recommendationCount: input.recommendations.length,
    groupCount: input.groupCount,
    conflictCount: input.conflictCount,
    resolutionCount: input.resolutionCount,
    topCategory: ordered[0]?.category ?? null,
    focusAreas: Object.freeze([...input.focusAreas]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
