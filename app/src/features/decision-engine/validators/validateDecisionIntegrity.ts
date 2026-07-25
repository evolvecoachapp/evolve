import type { CoachingDecision } from "../models/CoachingDecision";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateDecisionIntegrity(
  decisions: readonly CoachingDecision[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const d of decisions) {
    if (!d.id || !d.athleteId || !d.contextId) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Decision missing required identity fields",
          [d.id],
        ),
      );
    }
    if (d.reasons.length === 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Decision must include at least one reason",
          [d.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
