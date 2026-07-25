import type { CoachingExplanation } from "../models/CoachingExplanation";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";

export function validateEvidenceConsistency(
  explanations: readonly CoachingExplanation[],
): readonly ExplanationError[] {
  const errors: ExplanationError[] = [];
  for (const e of explanations) {
    for (const r of e.reasons) {
      for (const key of r.evidenceKeys) {
        if (!e.evidence.some((ev) => ev.key === key || ev.sourceKey === key)) {
          if (!e.sourceKeys.includes(key)) {
            errors.push(createExplanationError(ExplanationErrorCodes.VALIDATION_FAILED, `Reason references missing evidence key: ${key}`, e.id));
          }
        }
      }
    }
  }
  return Object.freeze(errors);
}
