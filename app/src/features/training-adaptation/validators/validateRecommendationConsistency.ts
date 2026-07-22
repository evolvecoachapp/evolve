import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import { ADAPTATION_ACTION_KINDS } from "../models/AdaptationAction";

/**
 * Validate recommendation payload consistency.
 */
export function validateRecommendationConsistency(
  recommendations: readonly AdaptationRecommendation[],
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const recommendation of recommendations) {
    if (!recommendation.id.trim()) {
      issues.push("recommendation_empty_id");
    }
    if (seen.has(recommendation.id)) {
      issues.push(`recommendation_duplicate_id:${recommendation.id}`);
    }
    seen.add(recommendation.id);

    if (
      !(ADAPTATION_ACTION_KINDS as readonly string[]).includes(
        recommendation.action.kind,
      )
    ) {
      issues.push(`recommendation_unknown_action:${recommendation.action.kind}`);
    }

    if (recommendation.action.magnitude < 0) {
      issues.push(`recommendation_negative_magnitude:${recommendation.id}`);
    }

    if (recommendation.action.priority < 0) {
      issues.push(`recommendation_negative_priority:${recommendation.id}`);
    }

    if (!recommendation.strategyId.trim()) {
      issues.push(`recommendation_empty_strategy:${recommendation.id}`);
    }
  }

  return Object.freeze(issues);
}
