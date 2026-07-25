import type { CoachingDecision } from "../models/CoachingDecision";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validatePriorities(
  decisions: readonly CoachingDecision[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const d of decisions) {
    if (d.priority.ordinal < 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Priority ordinal must be non-negative",
          [d.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
