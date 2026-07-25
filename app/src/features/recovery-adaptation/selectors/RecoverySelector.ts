import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { uniqueSorted } from "../utils/RecoveryAdaptationHelpers";

export function selectModificationIds(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.modifications.map((m) => m.id));
}

export function selectDecisionKeys(adaptation: RecoveryAdaptation | null): readonly string[] {
  if (!adaptation) return Object.freeze([]);
  return uniqueSorted(adaptation.decisionKeys);
}
