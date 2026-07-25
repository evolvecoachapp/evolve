import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { createWorkoutError, WorkoutErrorCodes } from "../models/WorkoutError";
import type { WorkoutError } from "../models/WorkoutError";

export function applyConsistencyPolicy(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  const errors: WorkoutError[] = [];
  if (!adaptation) return Object.freeze(errors);
  const ids = new Set<string>();
  for (const mod of adaptation.modifications) {
    if (ids.has(mod.id)) {
      errors.push(
        createWorkoutError(
          WorkoutErrorCodes.POLICY_BLOCKED,
          "Duplicate modification id",
          mod.id,
        ),
      );
    }
    ids.add(mod.id);
  }
  return Object.freeze(errors);
}
