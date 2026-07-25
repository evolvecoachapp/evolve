import type { RecommendationPackage } from "../models/RecommendationPackage";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateContextConsistency(
  pkg: RecommendationPackage,
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  if (pkg.athleteId !== pkg.recommendationContext.athleteId) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Package athleteId does not match context",
        pkg.id,
      ),
    );
  }
  if (pkg.contextId !== pkg.recommendationContext.contextId) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Package contextId does not match context",
        pkg.id,
      ),
    );
  }
  for (const r of pkg.recommendations) {
    if (r.contextId !== pkg.contextId) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Recommendation context mismatch",
          r.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
