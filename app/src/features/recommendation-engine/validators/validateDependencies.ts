import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateDependencies(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly RecommendationError[] {
  const ids = new Set(input.recommendations.map((r) => r.id));
  const errors: RecommendationError[] = [];
  for (const dep of input.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Dependency references unknown recommendation",
          dep.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
