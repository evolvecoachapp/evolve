import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateSnapshot(
  snapshot: AdaptationSnapshot | null,
): readonly AdaptationError[] {
  if (!snapshot) return Object.freeze([]);
  const errors: AdaptationError[] = [];
  if (!snapshot.athleteId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Snapshot athlete id required", snapshot.id),
    );
  }
  if (!snapshot.contextId) {
    errors.push(
      createAdaptationError(AdaptationErrorCodes.INVALID_INPUT, "Snapshot context id required", snapshot.id),
    );
  }
  return Object.freeze(errors);
}
