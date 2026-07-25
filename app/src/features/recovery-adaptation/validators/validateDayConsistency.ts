import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";

export function validateDayConsistency(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.recoveryDayAdjustments) {
    if (!adj.dayKey) {
      errors.push(
        createRecoveryError(
          RecoveryErrorCodes.INCONSISTENT_MEAL,
          "Day adjustment missing dayKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
