import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export function selectSessionKeys(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.sessionAdjustments.map((a) => a.sessionKey));
}
