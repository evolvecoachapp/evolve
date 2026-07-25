import type { CoachingRecommendation } from "../../recommendation-engine/models/CoachingRecommendation";

export function selectRecommendationById(
  recommendations: readonly CoachingRecommendation[],
  id: string,
): CoachingRecommendation | null {
  return recommendations.find((r) => r.id === id) ?? null;
}
