import type { GoalDependency } from "../models/GoalDependency";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateDependencies(
  dependencies: readonly GoalDependency[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  for (const dep of dependencies) {
    if (!dep.fromId || !dep.toId) {
      errors.push(
        createGoalError(
          GoalErrorCodes.VALIDATION_FAILED,
          "Dependency requires fromId and toId",
          dep.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
