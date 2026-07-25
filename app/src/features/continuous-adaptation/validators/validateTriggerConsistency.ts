import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function validateTriggerConsistency(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    for (const t of d.triggers) {
      if (t.present && !d.signalKeys.includes(t.signalKey)) {
        errors.push(
          createAdaptationError(
            AdaptationErrorCodes.INCONSISTENT_TRIGGER,
            `Present trigger signal missing from decision signalKeys: ${t.signalKey}`,
            d.id,
          ),
        );
      }
    }
  }
  return Object.freeze(errors);
}
