import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateRecommendationIntegrity(
  recommendations: readonly CoachingRecommendation[],
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  const ids = new Set<string>();
  for (const r of recommendations) {
    if (!r.id) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.INVALID_INPUT,
          "Recommendation id is required",
        ),
      );
    }
    if (ids.has(r.id)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Duplicate recommendation id",
          r.id,
        ),
      );
    }
    ids.add(r.id);
    if (!r.decisionId) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.MISSING_DECISIONS,
          "Recommendation must reference a decision",
          r.id,
        ),
      );
    }
    if (r.actions.length === 0) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Recommendation must include at least one action",
          r.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
