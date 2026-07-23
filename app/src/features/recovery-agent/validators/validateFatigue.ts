import type { FatigueState } from "../models/FatigueState";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateFatigue(fatigue: FatigueState): RecoveryValidation {
  const issues = [];
  if (fatigue.level < 0 || fatigue.level > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_FATIGUE,
        message: `Invalid fatigue level: ${fatigue.level}`,
        path: "fatigue.level",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
