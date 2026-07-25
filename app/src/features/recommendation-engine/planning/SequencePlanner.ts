import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationSequence } from "../models/RecommendationSequence";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeSequence } from "../utils/FreezeRecommendationState";
import { planActions } from "./ActionPlanner";

/**
 * Deterministic sequence planning — ordered steps only.
 */
export function planSequences(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationSequence[] {
  const steps = planActions(recommendations);
  if (steps.length === 0) return Object.freeze([]);
  return Object.freeze([
    freezeSequence({
      id: "sequence:primary",
      steps,
      ordered: true,
      metadata: EMPTY_RECOMMENDATION_METADATA,
    }),
  ]);
}
