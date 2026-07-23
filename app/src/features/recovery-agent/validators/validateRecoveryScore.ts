import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateRecoveryScore(score: number): RecoveryValidation {
  const issues = [];
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_RECOVERY_SCORE,
        message: `Recovery score out of range: ${score}`,
        path: "recoveryScore",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
