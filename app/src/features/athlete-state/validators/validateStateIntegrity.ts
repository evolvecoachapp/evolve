import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateStateIntegrity(
  state: AthleteState,
): StateValidation {
  const issues = [];
  if (!state.id) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "State id is required.",
      path: "id",
    });
  }
  if (!state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_IDENTITY,
      message: "athleteId is required.",
      path: "athleteId",
    });
  }
  if (state.identity.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "identity.athleteId must match athleteId.",
      path: "identity.athleteId",
    });
  }
  if (state.profile.identity.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "profile.identity.athleteId must match athleteId.",
      path: "profile.identity.athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
