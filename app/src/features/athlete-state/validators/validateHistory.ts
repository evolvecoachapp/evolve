import type { AthleteHistory } from "../models/AthleteHistory";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateHistory(input: {
  readonly athleteId: string;
  readonly history: AthleteHistory;
}): StateValidation {
  const issues = [];
  if (input.history.athleteId !== input.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_HISTORY,
      message: "History athleteId mismatch.",
      path: "history.athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
