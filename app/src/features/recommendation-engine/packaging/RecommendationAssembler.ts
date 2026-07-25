import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCollection } from "../models/RecommendationCollection";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";

/**
 * Deterministic assembly into a collection — no NL.
 */
export function assembleRecommendations(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly at: string;
}): RecommendationCollection {
  return Object.freeze({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    items: Object.freeze([...input.recommendations]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
