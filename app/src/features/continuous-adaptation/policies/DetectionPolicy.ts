import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Detection policy — present triggers must have signal keys. */
export function applyDetectionPolicy(
  triggers: readonly AdaptationTrigger[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const t of triggers) {
    if (t.present && !t.signalKey) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.INCONSISTENT_TRIGGER,
          "Present trigger missing signalKey",
          t.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
