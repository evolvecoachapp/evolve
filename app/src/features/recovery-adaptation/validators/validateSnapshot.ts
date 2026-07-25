import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";

export function validateSnapshot(snapshot: RecoverySnapshot | null): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!snapshot) return Object.freeze(errors);
  if (!snapshot.planId) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.MISSING_PLAN,
        "Snapshot plan id required",
        snapshot.id,
      ),
    );
  }
  return Object.freeze(errors);
}
