import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateDecisionLinks(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    if (e.decisionLink.decisionId !== e.decisionId) {
      errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Decision link mismatch", e.id));
    }
  }
  return Object.freeze(errors);
}
