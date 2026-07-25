import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";

export function applyWorkoutAdaptationPolicy(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) {
    errors.push(
      createWorkoutError(WorkoutErrorCodes.POLICY_BLOCKED, "Adaptation required for policy"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.blueprintId) {
    errors.push(
      createWorkoutError(
        WorkoutErrorCodes.POLICY_BLOCKED,
        "Adaptation must reference existing blueprint",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
