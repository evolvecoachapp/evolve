import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateSnapshot(
  snapshot: RecommendationSnapshot | null,
): readonly RecommendationError[] {
  if (!snapshot) return Object.freeze([]);
  const errors: RecommendationError[] = [];
  if (snapshot.recommendations.length === 0) {
    errors.push(
      createRecommendationError(
        RecommendationErrorCodes.VALIDATION_FAILED,
        "Snapshot has no recommendations",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
