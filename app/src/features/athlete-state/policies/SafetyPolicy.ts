import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

/**
 * Deterministic safety checks on represented flags only (no inference).
 */
export function applySafetyPolicy(state: AthleteState): StateValidation {
  const issues = [];
  for (const flag of state.constraints.medicalFlags) {
    if (!flag || flag.trim().length === 0) {
      issues.push({
        code: StateValidationCodes.SAFETY_VIOLATION,
        message: "Empty medical flag is not allowed.",
        path: "constraints.medicalFlags",
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
