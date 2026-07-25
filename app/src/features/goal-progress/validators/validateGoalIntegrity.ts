import type { GoalProgress } from "../models/GoalProgress";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateGoalIntegrity(
  decisions: readonly GoalProgress[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  const ids = new Set<string>();
  for (const d of decisions) {
    if (!d.id)
      errors.push(createGoalError(GoalErrorCodes.INVALID_INPUT, "Decision id required"));
    if (ids.has(d.id))
      errors.push(
        createGoalError(GoalErrorCodes.VALIDATION_FAILED, "Duplicate decision id", d.id),
      );
    ids.add(d.id);
    if (!d.athleteId)
      errors.push(
        createGoalError(GoalErrorCodes.MISSING_ATHLETE, "Athlete id required", d.id),
      );
    if (!d.contextId)
      errors.push(
        createGoalError(GoalErrorCodes.INVALID_INPUT, "Context id required", d.id),
      );
  }
  return Object.freeze(errors);
}
