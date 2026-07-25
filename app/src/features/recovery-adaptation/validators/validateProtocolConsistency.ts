import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";

export function validateProtocolConsistency(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.readinessAdjustments) {
    if (!adj.readinessKey) {
      errors.push(
        createRecoveryError(
          RecoveryErrorCodes.INCONSISTENT_MACRO,
          "Protocol adjustment missing readinessKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
