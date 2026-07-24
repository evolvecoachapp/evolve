import type { AthletePreferences } from "../models/AthletePreferences";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validatePreferences(
  preferences: AthletePreferences,
): StateValidation {
  const issues = [];
  if (!Array.isArray(preferences.preferredTrainingTimes)) {
    issues.push({
      code: StateValidationCodes.INVALID_PREFERENCES,
      message: "preferredTrainingTimes must be an array.",
      path: "preferences.preferredTrainingTimes",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
