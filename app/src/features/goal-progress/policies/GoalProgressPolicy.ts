import type { GoalProgress } from "../models/GoalProgress";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

/** Structural adaptation policy — no AI. */
export function applyGoalProgressPolicy(
  decisions: readonly GoalProgress[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  for (const d of decisions) {
    if (d.triggers.some((t) => t.present) && d.reasons.length === 0) {
      errors.push(
        createGoalError(
          GoalErrorCodes.POLICY_BLOCKED,
          "Present triggers require reasons",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
