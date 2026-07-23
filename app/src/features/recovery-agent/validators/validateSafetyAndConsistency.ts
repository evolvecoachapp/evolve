import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryPlan } from "../models/RecoveryPlan";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateSafety(plan: RecoveryPlan): RecoveryValidation {
  const issues = [];
  if (plan.recoveryScoreTarget < 0 || plan.recoveryScoreTarget > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.SAFETY_VIOLATION,
        message: "Recovery score target out of range",
        path: "recoveryScoreTarget",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateConsistency(plan: RecoveryPlan): RecoveryValidation {
  const issues = [];
  if (plan.fatigueCeiling < 0 || plan.stressCeiling < 0) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.CONSISTENCY_ERROR,
        message: "Ceilings must be non-negative",
        path: "ceilings",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}

export function validateConstraints(
  context: RecoveryContext,
  plan: RecoveryPlan,
): RecoveryValidation {
  const issues = [];
  if (
    context.constraints.avoidDeload &&
    plan.deloadRecommendation.recommended
  ) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.CONSTRAINT_VIOLATION,
        message: "Deload conflicts with avoidDeload constraint",
        path: "deloadRecommendation",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
