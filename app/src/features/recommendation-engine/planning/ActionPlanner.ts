import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationStep } from "../models/RecommendationStep";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezeStep } from "../utils/FreezeRecommendationState";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic action planning — structured steps only.
 */
export function planActions(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationStep[] {
  const ordered = sortRecommendationsByPriority(recommendations);
  const steps: RecommendationStep[] = [];
  let order = 0;
  for (const rec of ordered) {
    for (const action of rec.actions) {
      steps.push(
        freezeStep({
          id: `step:${rec.id}:${action.id}`,
          order: order++,
          action,
          label: action.key,
          optional: rec.intent === "defer" || rec.intent === "monitor",
          metadata: EMPTY_RECOMMENDATION_METADATA,
        }),
      );
    }
  }
  return Object.freeze(steps);
}
