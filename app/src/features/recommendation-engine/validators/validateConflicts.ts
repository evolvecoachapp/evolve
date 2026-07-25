import type { RecommendationConflict } from "../models/RecommendationConflict";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateConflicts(
  conflicts: readonly RecommendationConflict[],
): readonly RecommendationError[] {
  const errors: RecommendationError[] = [];
  for (const conflict of conflicts) {
    if (!conflict.resolved) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.CONFLICT_UNRESOLVED,
          "Conflict is unresolved",
          conflict.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
