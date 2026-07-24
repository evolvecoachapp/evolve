import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";
import { isVersionNonNegative } from "../utils/VersionHelpers";

export function validateVersionConsistency(
  state: AthleteState,
): StateValidation {
  const issues = [];
  if (!isVersionNonNegative(state.version)) {
    issues.push({
      code: StateValidationCodes.INVALID_VERSION,
      message: "Version components must be non-negative.",
      path: "version",
    });
  }
  if (state.summary && state.summary.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_VERSION,
      message: "Summary athleteId mismatch.",
      path: "summary.athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
