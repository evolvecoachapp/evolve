import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic consistency policy — require source keys.
 */
export function applyConsistencyPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations.map((r) => {
      if (r.sourceKeys.length > 0) return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        confidence: Object.freeze({
          ...r.confidence,
          level: "low",
          score: Math.min(r.confidence.score, 40),
          notes: Object.freeze([...r.confidence.notes, "missing_source_keys"]),
        }),
      });
    }),
  );
}
