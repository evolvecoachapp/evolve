import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic urgency resolution — safety boost only.
 */
export function resolveUrgency(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.category !== "safety") return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        priority: Object.freeze({
          ...r.priority,
          urgency: Math.max(r.priority.urgency, 100),
          ordinal: 0,
        }),
      });
    }),
  );
}
