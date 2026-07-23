import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateDOMS(sorenessLevel: number): RecoveryValidation {
  const issues = [];
  if (sorenessLevel < 0 || sorenessLevel > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_DOMS,
        message: `Invalid soreness level: ${sorenessLevel}`,
        path: "indicators.sorenessLevel",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
