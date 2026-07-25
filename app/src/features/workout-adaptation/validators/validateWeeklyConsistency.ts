import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";

export function validateWeeklyConsistency(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.weeklyAdjustments) {
    if (!adj.weekKey) {
      errors.push(
        createWorkoutError(
          WorkoutErrorCodes.INCONSISTENT_WEEK,
          "Weekly adjustment missing weekKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
