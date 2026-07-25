import type { AdaptationPackage } from "../models/AdaptationPackage";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/**
 * Safety: handoffs are inputs only — package must not claim plan mutation.
 * Enforced by absence of mutation fields (structural check on handoff ids).
 */
export function applySafetyPolicy(pkg: AdaptationPackage): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  const handoffs = [
    pkg.workoutAdaptationInput,
    pkg.nutritionAdaptationInput,
    pkg.recoveryAdaptationInput,
    pkg.goalProgressInput,
  ];
  for (const h of handoffs) {
    if (h && !h.id.startsWith("handoff:")) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Handoff id must use handoff: prefix (inputs only)",
          h.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
