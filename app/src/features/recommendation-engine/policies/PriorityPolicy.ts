import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority policy — safety-first ordering.
 */
export function applyPriorityPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
