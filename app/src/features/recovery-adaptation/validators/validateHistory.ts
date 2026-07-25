import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoveryHistory } from "../models/RecoveryHistory";

export function validateHistory(history: RecoveryHistory | null): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!history) return Object.freeze(errors);
  if (!history.athleteId) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.MISSING_ATHLETE, "History athlete id required", history.id),
    );
  }
  return Object.freeze(errors);
}
