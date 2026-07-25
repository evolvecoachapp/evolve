import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

import type { CoachingExplanation } from "../models/CoachingExplanation";

export function validateExplanationIntegrity(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  const ids = new Set<string>();
  for (const e of explanations) {
    if (!e.id) errors.push(createExplanationError(ExplanationErrorCodes.INVALID_INPUT, "Explanation id required"));
    if (ids.has(e.id)) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Duplicate explanation id", e.id));
    ids.add(e.id);
    if (!e.decisionId) errors.push(createExplanationError(ExplanationErrorCodes.MISSING_DECISIONS, "Explanation must link decision", e.id));
    if (!e.recommendationId) errors.push(createExplanationError(ExplanationErrorCodes.MISSING_RECOMMENDATIONS, "Explanation must link recommendation", e.id));
    if (e.reasons.length === 0) errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, "Explanation must include reasons", e.id));
  }
  return Object.freeze(errors);
}

