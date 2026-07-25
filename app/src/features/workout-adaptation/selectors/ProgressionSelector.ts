import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export function selectProgressionKeys(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.progressionAdjustments.map((a) => a.progressionKey));
}
