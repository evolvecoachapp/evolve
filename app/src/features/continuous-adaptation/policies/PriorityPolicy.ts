import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

export function applyPriorityPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.priority.ordinal < 0 || d.priority.ordinal > 3) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Priority ordinal out of fixed table range",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
