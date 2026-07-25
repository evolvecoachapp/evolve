import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";

export function validateDependencies(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  for (const mod of adaptation.modifications) {
    if (mod.sourceDecisionKeys.length === 0) {
      errors.push(
        createRecoveryError(
          RecoveryErrorCodes.VALIDATION_FAILED,
          "Modification missing source decision keys",
          mod.id,
        ),
      );
    }
  }
  return Object.freeze(errors);
}
