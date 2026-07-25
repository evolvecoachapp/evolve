import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic priority planning — reordering only.
 */
export function planPriorities(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return sortRecommendationsByPriority(recommendations);
}
