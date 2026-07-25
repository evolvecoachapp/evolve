import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionRecommendationReference } from "../models/DecisionRecommendationReference";

export function selectRecommendationRefs(
  decisions: readonly CoachingDecision[],
): readonly DecisionRecommendationReference[] {
  return Object.freeze(decisions.flatMap((d) => d.recommendationRefs));
}
