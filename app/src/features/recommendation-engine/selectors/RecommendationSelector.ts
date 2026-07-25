import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationCategory } from "../models/RecommendationCategory";

export function selectByCategory(
  recommendations: readonly CoachingRecommendation[],
  category: RecommendationCategory,
): readonly CoachingRecommendation[] {
  return Object.freeze(recommendations.filter((r) => r.category === category));
}

export function selectPrimary(
  recommendations: readonly CoachingRecommendation[],
): CoachingRecommendation | null {
  return recommendations[0] ?? null;
}
