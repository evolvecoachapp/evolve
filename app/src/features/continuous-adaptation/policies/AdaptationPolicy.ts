import type { AdaptationDecision } from "../models/AdaptationDecision";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";

/** Structural adaptation policy — no AI. */
export function applyAdaptationPolicy(
  decisions: readonly AdaptationDecision[],
): readonly AdaptationError[] {
  const errors: AdaptationError[] = [];
  for (const d of decisions) {
    if (d.triggers.some((t) => t.present) && d.reasons.length === 0) {
      errors.push(
        createAdaptationError(
          AdaptationErrorCodes.POLICY_BLOCKED,
          "Present triggers require reasons",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
