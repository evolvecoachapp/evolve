import type { GoalSnapshot } from "../models/GoalSnapshot";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateSnapshot(
  snapshot: GoalSnapshot | null,
): readonly GoalError[] {
  if (!snapshot) return Object.freeze([]);
  const errors: GoalError[] = [];
  if (!snapshot.athleteId) {
    errors.push(
      createGoalError(GoalErrorCodes.MISSING_ATHLETE, "Snapshot athlete id required", snapshot.id),
    );
  }
  if (!snapshot.contextId) {
    errors.push(
      createGoalError(GoalErrorCodes.INVALID_INPUT, "Snapshot context id required", snapshot.id),
    );
  }
  return Object.freeze(errors);
}
