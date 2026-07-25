import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import type { RecoveryError } from "../models/RecoveryError";

/** Recovery recovery policy: allow recovery-linked adjustments with source keys. */
export function applyRecoveryPolicy(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.deloadAdjustments) {
    void adj;
  }
  return Object.freeze(errors);
}
