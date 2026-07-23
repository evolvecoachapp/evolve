import type { StressProfile } from "../models/StressProfile";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateStress(stress: StressProfile): RecoveryValidation {
  const issues = [];
  if (stress.level < 0 || stress.level > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_STRESS,
        message: `Invalid stress level: ${stress.level}`,
        path: "stress.level",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
