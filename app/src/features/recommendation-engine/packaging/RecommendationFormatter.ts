import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationView } from "../models/RecommendationView";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeView } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Structured formatter — keys / ordering only, no natural language.
 */
export function formatRecommendationView(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly groups: readonly RecommendationGroup[];
  readonly at: string;
}): RecommendationView {
  const ordered = sortRecommendationsByPriority(input.recommendations);
  return freezeView({
    id: input.id,
    athleteId: input.athleteId,
    contextId: input.contextId,
    primary: ordered[0] ?? null,
    ordered,
    groups: input.groups,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}
