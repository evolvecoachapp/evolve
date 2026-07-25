import type { CoachingRecommendation } from "../models/CoachingRecommendation";

/**
 * Structured formatting helpers — no natural language generation.
 */
export function formatRecommendationKey(
  recommendation: CoachingRecommendation,
): string {
  return `${recommendation.category}:${recommendation.type}:${recommendation.id}`;
}

export function formatOrderedKeys(
  recommendations: readonly CoachingRecommendation[],
): readonly string[] {
  return Object.freeze(recommendations.map(formatRecommendationKey));
}
