import type { RecoveryPackage } from "../models/RecoveryPackage";
import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";

/** Safety: adaptations must originate from existing plan structure keys. */
export function applySafetyPolicy(pkg: RecoveryPackage): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!pkg.updatedPlan) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.POLICY_BLOCKED, "Updated plan required", pkg.id),
    );
  } else if (!pkg.updatedPlan.planId) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.POLICY_BLOCKED,
        "Cannot adapt without existing plan id",
        pkg.updatedPlan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
