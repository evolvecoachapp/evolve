import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority resolution — ordinal / urgency tables only.
 */
export function resolvePriorities(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
