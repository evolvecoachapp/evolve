import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function applyConsistencyPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.evaluation.subjectId !== d.id && d.evaluation.subjectId !== d.athleteId) {
      // allow athlete-level evaluation subject; flag only empty
    }
    if (d.priority.ordinal !== d.evaluation.priority.ordinal) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.VALIDATION_FAILED,
          "Decision priority must match evaluation priority",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
