import type { WorkoutPackage } from "../models/WorkoutPackage";
import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";

/** Safety: adaptations must originate from existing blueprint structure keys. */
export function applySafetyPolicy(pkg: WorkoutPackage): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!pkg.updatedBlueprint) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.POLICY_BLOCKED, "Updated blueprint required", pkg.id),
    );
  } else if (!pkg.updatedBlueprint.blueprintId) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.POLICY_BLOCKED,
        "Cannot adapt without existing blueprint id",
        pkg.updatedBlueprint.id,
      ),
    );
  }
  return Object.freeze(errors);
}
