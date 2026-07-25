import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateAdaptationIntegrity(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  const ids = new Set<string>();
  for (const d of decisions) {
    if (!d.id)
      errors.push(createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Decision id required"));
    if (ids.has(d.id))
      errors.push(
        createAdaptationError(AdaptationErrorCodes.VALIDATION_FAILED, "Duplicate decision id", d.id),
      );
    ids.add(d.id);
    if (!d.athleteId)
      errors.push(
        createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Athlete id required", d.id),
      );
    if (!d.contextId)
      errors.push(
        createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Context id required", d.id),
      );
  }
  return Object.freeze(errors);
}
