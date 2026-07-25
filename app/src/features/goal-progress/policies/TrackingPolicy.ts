import type { GoalProgressInput } from "../models/GoalProgressInput";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";

/** Observation policy — require athlete id for monitoring. */
export function applyTrackingPolicy(input: GoalProgressInput): readonly GoalError[] {
  if (!input.athleteId) {
    return Object.freeze([
      createGoalError(GoalErrorCodes.MISSING_ATHLETE, "Athlete id required for monitoring"),
    ]);
  }
  return Object.freeze([]);
}
