import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export function selectExerciseKeys(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.exerciseAdjustments.map((a) => a.exerciseKey));
}
