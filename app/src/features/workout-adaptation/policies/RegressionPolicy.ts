import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutError } from "../models/WorkoutError";

export function applyRegressionPolicy(
  adaptation: WorkoutAdaptation | null,
): readonly WorkoutError[] {
  void adaptation;
  return Object.freeze([] as WorkoutError[]);
}
