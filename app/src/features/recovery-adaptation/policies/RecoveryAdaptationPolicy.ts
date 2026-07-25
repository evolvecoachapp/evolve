import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";

export function applyRecoveryAdaptationPolicy(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.POLICY_BLOCKED, "Adaptation required for policy"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.planId) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.POLICY_BLOCKED,
        "Adaptation must reference existing plan",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
