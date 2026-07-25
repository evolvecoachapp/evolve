import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export function selectFatigueKeys(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.mobilityAdjustments.map((a) => a.mobilityKey));
}
