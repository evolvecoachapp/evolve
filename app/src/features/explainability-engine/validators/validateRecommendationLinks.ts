import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateRecommendationLinks(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    if (e.recommendationLink.recommendationId !== e.recommendationId) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Recommendation link mismatch", e.id));
    }
  }
  return Object.freeze(errors);
}
