import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import { uniqueSorted } from "../utils/WorkoutAdaptationHelpers";

export function selectModificationIds(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.modifications.map((m) => m.id));
}

export function selectDecisionKeys(adaptation: WorkoutAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.decisionKeys);
}
