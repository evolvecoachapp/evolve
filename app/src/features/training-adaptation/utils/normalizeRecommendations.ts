import type { AdaptationAction } from "../models/AdaptationAction";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";

/**
 * Normalize a recommendation id and freeze nested action fields.
 */
export function normalizeRecommendation(
  recommendation: AdaptationRecommendation,
): AdaptationRecommendation {
  return Object.freeze({
    ...recommendation,
    id: recommendation.id.trim(),
    action: normalizeAction(recommendation.action),
    reasons: Object.freeze(
      recommendation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
    score: Object.freeze({ ...recommendation.score }),
  });
}

export function normalizeAction(action: AdaptationAction): AdaptationAction {
  return Object.freeze({
    ...action,
    magnitude: Math.max(0, action.magnitude),
    priority: Math.max(0, action.priority),
  });
}

/**
 * Deduplicate recommendations by id (first wins), then freeze.
 */
export function normalizeRecommendations(
  recommendations: readonly AdaptationRecommendation[],
): readonly AdaptationRecommendation[] {
  const seen = new Set<string>();
  const unique: AdaptationRecommendation[] = [];
  for (const recommendation of recommendations) {
    const normalized = normalizeRecommendation(recommendation);
    if (seen.has(normalized.id)) {
      continue;
    }
    seen.add(normalized.id);
    unique.push(normalized);
  }
  return Object.freeze(unique);
}
