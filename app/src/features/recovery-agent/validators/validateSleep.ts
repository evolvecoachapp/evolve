import type { SleepProfile } from "../models/SleepProfile";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

export function validateSleep(sleep: SleepProfile): RecoveryValidation {
  const issues = [];
  if (sleep.hours < 0 || sleep.hours > 24) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_SLEEP,
        message: `Invalid sleep hours: ${sleep.hours}`,
        path: "sleep.hours",
      }),
    );
  }
  if (sleep.quality < 0 || sleep.quality > 100) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_SLEEP,
        message: `Invalid sleep quality: ${sleep.quality}`,
        path: "sleep.quality",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
