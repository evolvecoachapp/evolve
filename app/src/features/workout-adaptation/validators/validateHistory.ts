import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutHistory } from "../models/WorkoutHistory";

export function validateHistory(history: WorkoutHistory | null): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!history) return Object.freeze(errors);
  if (!history.athleteId) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  return Object.freeze(errors);
}
