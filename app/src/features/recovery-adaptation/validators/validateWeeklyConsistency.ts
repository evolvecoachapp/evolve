import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";

export function validateWeeklyConsistency(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const adj of adaptation.weeklyAdjustments) {
    if (!adj.weekKey) {
      errors.push(
        createRecoveryError(
          RecoveryErrorCodes.INCONSISTENT_WEEK,
          "Weekly adjustment missing weekKey",
          adj.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
