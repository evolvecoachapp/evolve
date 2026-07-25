import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export function selectWeekKeys(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.weeklyAdjustments.map((a) => a.weekKey));
}
