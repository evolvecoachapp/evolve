import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";
import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";

export function validateDependencies(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const mod of adaptation.modifications) {
    if (mod.sourceDecisionKeys.length === 0) {
      errors.push(
        createWorkoutError(
          WorkoutErrorCodes.VALIDATION_FAILED,
          "Modification missing source decision keys",
          mod.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
