import type { RecommendationPlan } from "../models/RecommendationPlan";
import {
  createRecommendationError,
  RecommendationErrorCodes,
  type RecommendationError,
} from "../models/RecommendationError";

export function validateOrdering(
  plan: RecommendationPlan | null,
): readonly RecommendationError[] {
  if (!plan) return Object.freeze([]);
  const errors: RecommendationError[] = [];
  const seen = new Set<string>();
  for (const id of plan.orderedIds) {
    if (seen.has(id)) {
      errors.push(
        createRecommendationError(
          RecommendationErrorCodes.VALIDATION_FAILED,
          "Duplicate id in ordering",
          id,
        ),
      );
    }
    seen.add(id);
  }
  return Object.freeze(errors);
}
