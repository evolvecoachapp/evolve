import type { AdaptationInput } from "../models/AdaptationInput";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Observation policy — require athlete id for monitoring. */
export function applyMonitoringPolicy(input: AdaptationInput): readonly AdaptationError[] {
  if (!input.athleteId) {
    return Object.freeze([
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Athlete id required for monitoring"),
    ]);
  }
  return Object.freeze([]);
}
