import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";

export function validateAdaptationIntegrity(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.MISSING_INPUT, "Adaptation record required"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.athleteId) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.MISSING_ATHLETE, "Athlete id required", adaptation.id),
    );
  }
  if (!adaptation.blueprintId) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.MISSING_BLUEPRINT,
        "Blueprint id required",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
