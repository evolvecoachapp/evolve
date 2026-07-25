import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export function selectWeekKeys(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.weeklyAdjustments.map((a) => a.weekKey));
}
