import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutSnapshot } from "../models/WorkoutSnapshot";

export function validateSnapshot(snapshot: WorkoutSnapshot | null): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!snapshot) return Object.freeze(errors);
  if (!snapshot.blueprintId) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.MISSING_BLUEPRINT,
        "Snapshot blueprint id required",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
