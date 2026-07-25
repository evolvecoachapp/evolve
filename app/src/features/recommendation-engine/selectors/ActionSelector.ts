import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationAction } from "../models/RecommendationAction";

export function selectActions(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationAction[] {
  return Object.freeze(recommendations.flatMap((r) => r.actions));
}
