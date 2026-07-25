import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";

export function validateExerciseConsistency(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.exerciseAdjustments) {
    if (!adj.exerciseKey) {
      errors.push(
        createWorkoutError(
          WorkoutErrorCodes.INCONSISTENT_EXERCISE,
          "Exercise adjustment missing exerciseKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
