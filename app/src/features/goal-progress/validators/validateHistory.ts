import type { GoalHistory } from "../models/GoalHistory";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

export function validateHistory(
  history: GoalHistory | null,
): readonly GoalError[] {
  if (!history) return Object.freeze([]);
  const errors: GoalError[] = [];
  if (!history.athleteId) {
    errors.push(
      createGoalError(GoalErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  const ids = new Set<string>();
  for (const e of history.entries) {
    if (ids.has(e.id)) {
      errors.push(
        createGoalError(GoalErrorCodes.VALIDATION_FAILED, "Duplicate history entry", e.id),
      );
    }
    ids.add(e.id);
  }
  return Object.freeze(errors);
}
