import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

export function selectHighestPriority(
  recommendations: readonly CoachingRecommendation[],
): CoachingRecommendation | null {
  return sortRecommendationsByPriority(recommendations)[0] ?? null;
}
