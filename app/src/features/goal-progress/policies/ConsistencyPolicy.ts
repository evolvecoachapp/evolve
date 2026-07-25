import type { GoalProgress } from "../models/GoalProgress";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function applyConsistencyPolicy(
  decisions: readonly GoalProgress[],
): readonly GoalError[] {
  const errors: GoalError[] = [];
  for (const d of decisions) {
    if (d.evaluation.subjectId !== d.id && d.evaluation.subjectId !== d.athleteId) {
      // allow athlete-level evaluation subject; flag only empty
    }
    if (d.priority.ordinal !== d.evaluation.priority.ordinal) {
      errors.push(
        createGoalError(
          GoalErrorCodes.VALIDATION_FAILED,
          "Decision priority must match evaluation priority",
          d.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
