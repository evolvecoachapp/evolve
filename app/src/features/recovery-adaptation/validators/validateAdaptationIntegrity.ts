import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";

export function validateAdaptationIntegrity(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.MISSING_INPUT, "Adaptation record required"),
    );
    return Object.freeze(errors);
  }
  if (!adaptation.athleteId) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.MISSING_ATHLETE, "Athlete id required", adaptation.id),
    );
  }
  if (!adaptation.planId) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.MISSING_PLAN,
        "Plan id required",
        adaptation.id,
      ),
    );
  }
  return Object.freeze(errors);
}
