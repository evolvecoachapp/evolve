import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic safety policy — force safety escalate to top urgency.
 */
export function applySafetyPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.category !== "safety") return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        intent: "escalate",
        priority: Object.freeze({
          ...r.priority,
          ordinal: 0,
          urgency: 100,
          label: "safety",
        }),
      });
    }),
  );
}
