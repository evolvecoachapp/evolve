import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic recommendation policy — drop empty-action items.
 */
export function applyRecommendationPolicy(
  recommendations: readonly CoachingRecommendation[],
): readonly CoachingRecommendation[] {
  return Object.freeze(
    recommendations
      .filter((r) => r.actions.length > 0)
      .map((r) => freezeRecommendation(r)),
  );
}
