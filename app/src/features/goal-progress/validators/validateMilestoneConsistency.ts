import type { GoalProgress } from "../models/GoalProgress";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateMilestoneConsistency(
  decisions: readonly GoalProgress[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  for (const d of decisions) {
    for (const t of d.triggers) {
      if (t.present && !d.signalKeys.includes(t.signalKey)) {
        errors.push(
          createGoalError(
            GoalErrorCodes.INCONSISTENT_TRIGGER,
            `Present trigger signal missing from decision signalKeys: ${t.signalKey}`,
            d.id,
          ),
        );
      }
    }
  }
  return Object.freeze(errors);
}
