import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { UpdatedWorkoutBlueprint } from "../models/UpdatedWorkoutBlueprint";

export function validateBlueprintIntegrity(
  blueprint: UpdatedWorkoutBlueprint | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!blueprint) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.MISSING_BLUEPRINT, "Updated blueprint required"),
    );
    return Object.freeze(errors);
  }
  if (!blueprint.blueprintId) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.MISSING_BLUEPRINT,
        "Blueprint id required",
        blueprint.id,
      ),
    );
  }
  if (
    blueprint.exerciseKeys.length === 0 &&
    blueprint.sessionKeys.length === 0 &&
    blueprint.dayKeys.length === 0
  ) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.EMPTY_BLUEPRINT,
        "Updated blueprint has no structure keys",
        blueprint.id,
      ),
    );
  }
  return Object.freeze(errors);
}
