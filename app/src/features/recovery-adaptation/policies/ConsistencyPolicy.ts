import type { RecoveryAdaptation } from "../models/RecoveryAdaptation";
import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";

export function applyConsistencyPolicy(
  adaptation: RecoveryAdaptation | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!adaptation) return Object.freeze(errors);
  const ids = new Set<string>();
  for (const mod of adaptation.modifications) {
    if (ids.has(mod.id)) {
      errors.push(
        createRecoveryError(
          RecoveryErrorCodes.POLICY_BLOCKED,
          "Duplicate modification id",
          mod.id,
        ),
      );
    }
    ids.add(mod.id);
  }
  return Object.freeze(errors);
}
