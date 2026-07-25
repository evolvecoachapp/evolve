import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export function selectProtocolKeys(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.readinessAdjustments.map((a) => a.readinessKey));
}
