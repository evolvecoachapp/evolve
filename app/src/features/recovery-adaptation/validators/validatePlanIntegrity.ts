import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryError } from "../models/RecoveryError";
import type { UpdatedRecoveryPlan } from "../models/UpdatedRecoveryPlan";

export function validatePlanIntegrity(
  plan: UpdatedRecoveryPlan | null,
): readonly RecoveryError[] {
  const errors: RecoveryError[] = [];
  if (!plan) {
    errors.push(
      createRecoveryError(RecoveryErrorCodes.MISSING_PLAN, "Updated plan required"),
    );
    return Object.freeze(errors);
  }
  if (!plan.planId) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.MISSING_PLAN,
        "Plan id required",
        plan.id,
      ),
    );
  }
  if (
    plan.sleepKeys.length === 0 &&
    plan.protocolKeys.length === 0 &&
    plan.dayKeys.length === 0
  ) {
    errors.push(
      createRecoveryError(
        RecoveryErrorCodes.EMPTY_PLAN,
        "Updated plan has no structure keys",
        plan.id,
      ),
    );
  }
  return Object.freeze(errors);
}
