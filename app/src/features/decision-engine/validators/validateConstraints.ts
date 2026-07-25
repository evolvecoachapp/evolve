import type { DecisionConstraint } from "../models/DecisionConstraint";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConstraints(
  constraints: readonly DecisionConstraint[],
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  for (const c of constraints) {
    if (c.subjectKeys.length === 0) {
      errors.push(
        createDecisionError(
          DecisionErrorCodes.VALIDATION_FAILED,
          "Constraint requires subject keys",
          [c.id],
        ),
      );
    }
  }
  return Object.freeze(errors);
}
