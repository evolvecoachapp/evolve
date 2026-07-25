import type { DecisionPackage } from "../models/DecisionPackage";
import {
  createDecisionError,
  DecisionErrorCodes,
  type DecisionError,
} from "../models/DecisionError";

export function validateConsistency(
  pkg: DecisionPackage,
): readonly DecisionError[] {
  const errors: DecisionError[] = [];
  if (pkg.summary && pkg.summary.decisionCount !== pkg.decisions.length) {
    errors.push(
      createDecisionError(
        DecisionErrorCodes.VALIDATION_FAILED,
        "Summary decisionCount mismatch",
        [pkg.id],
      ),
    );
  }
  return Object.freeze(errors);
}
