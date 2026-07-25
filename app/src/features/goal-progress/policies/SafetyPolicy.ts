import type { GoalPackage } from "../models/GoalPackage";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

/**
 * Safety: handoffs are inputs only — package must not claim plan mutation.
 * Enforced by absence of mutation fields (structural check on handoff ids).
 */
export function applySafetyPolicy(pkg: GoalPackage): readonly GoalError[] {
  const errors: GoalError[] = [];
  const handoff = pkg.continuousAdaptationInput;
  if (handoff && !handoff.id.startsWith("handoff:")) {
    errors.push(
      createGoalError(
        GoalErrorCodes.POLICY_BLOCKED,
        "Handoff id must use handoff: prefix (inputs only)",
        handoff.id,
      ),
    );
  }
  return Object.freeze(errors);
}
