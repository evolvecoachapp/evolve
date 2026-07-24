import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateSnapshot(snapshot: AthleteSnapshot): StateValidation {
  const issues = [];
  if (!snapshot.id) {
    issues.push({
      code: StateValidationCodes.INVALID_SNAPSHOT,
      message: "Snapshot id is required.",
      path: "id",
    });
  }
  if (snapshot.athleteId !== snapshot.state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_SNAPSHOT,
      message: "Snapshot athleteId must match state.athleteId.",
      path: "athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
