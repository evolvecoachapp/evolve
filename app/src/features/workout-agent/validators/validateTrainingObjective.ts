import type { WorkoutObjective } from "../models/WorkoutObjective";
import { ALL_WORKOUT_OBJECTIVES } from "../models/WorkoutObjective";
import type { WorkoutValidation } from "../models/WorkoutValidation";
import { WorkoutValidationCodes } from "../models/WorkoutValidation";
import { freezeValidation } from "../utils/freezeAgentState";

export function validateTrainingObjective(
  objective: WorkoutObjective | null | undefined,
): WorkoutValidation {
  const issues = [];
  if (!objective) {
    issues.push({
      code: WorkoutValidationCodes.MISSING_OBJECTIVE,
      message: "Training objective is required.",
      path: "objective",
    });
  } else if (!ALL_WORKOUT_OBJECTIVES.includes(objective)) {
    issues.push({
      code: WorkoutValidationCodes.INVALID_OBJECTIVE,
      message: `Unknown objective: ${String(objective)}`,
      path: "objective",
    });
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
