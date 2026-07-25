import type { AdaptationHistory } from "../models/AdaptationHistory";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateHistory(
  history: AdaptationHistory | null,
): readonly AdaptationError[] {
  if (!history) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  if (!history.athleteId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  const ids = new Set<string>();
  for (const e of history.entries) {
    if (ids.has(e.id)) {
      errors.push(
        createAdaptationError(AdaptationErrorCodes.VALIDATION_FAILED, "Duplicate history entry", e.id),
      );
    }
    ids.add(e.id);
  }
  return Object.freeze(errors);
}
