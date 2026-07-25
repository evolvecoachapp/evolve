import type { GoalAchievement } from "../models/GoalAchievement";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

/** Detection policy — present triggers must have signal keys. */
export function applyMilestonePolicy(
  triggers: readonly GoalAchievement[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  for (const t of triggers) {
    if (t.present && !t.signalKey) {
      errors.push(
        createGoalError(
          GoalErrorCodes.INCONSISTENT_TRIGGER,
          "Present trigger missing signalKey",
          t.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
