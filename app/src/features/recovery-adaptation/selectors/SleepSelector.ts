import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export function selectDayKeys(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.recoveryDayAdjustments.map((a) => a.dayKey));
}
