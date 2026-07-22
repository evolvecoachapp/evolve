import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import { compareRecommendations } from "../utils/sortRecommendations";

/**
 * Validate that recommendations are ordered by priority asc, then id asc.
 */
export function validateAdaptationOrdering(
  recommendations: readonly AdaptationRecommendation[],
): readonly string[] {
  const issues: string[] = [];

  for (let index = 1; index < recommendations.length; index += 1) {
    const previous = recommendations[index - 1]!;
    const current = recommendations[index]!;
    if (compareRecommendations(previous, current) > 0) {
      issues.push(
        `adaptation_order_violation:${previous.id}->${current.id}`,
      );
    }
  }

  return Object.freeze(issues);
}
