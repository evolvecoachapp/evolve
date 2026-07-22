import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";

/**
 * Sort recommendations by action priority asc, then id asc (deterministic).
 */
export function sortRecommendations(
  recommendations: readonly AdaptationRecommendation[],
): readonly AdaptationRecommendation[] {
  return Object.freeze(
    [...recommendations].sort((left, right) => {
      if (left.action.priority !== right.action.priority) {
        return left.action.priority - right.action.priority;
      }
      return left.id.localeCompare(right.id);
    }),
  );
}

/**
 * Compare two recommendations for deterministic ordering.
 */
export function compareRecommendations(
  left: AdaptationRecommendation,
  right: AdaptationRecommendation,
): number {
  if (left.action.priority !== right.action.priority) {
    return left.action.priority - right.action.priority;
  }
  return left.id.localeCompare(right.id);
}
