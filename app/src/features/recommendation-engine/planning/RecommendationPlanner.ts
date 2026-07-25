import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezePlan } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic recommendation plan — no execution.
 */
export function planRecommendations(input: {
  readonly planId: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly at: string;
}): RecommendationPlan {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezePlan({
    id: input.planId,
    athleteId: input.athleteId,
    contextId: input.contextId,
    orderedIds: Object.freeze(ordered.map((r) => r.id)),
    steps: Object.freeze([]),
    sequences: Object.freeze([]),
    groups: Object.freeze([]),
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
