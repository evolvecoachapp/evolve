import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function applyConsistencyPolicy(state: AthleteState): StateValidation {
  const issues = [];
  if (state.history.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "History athleteId inconsistency.",
      path: "history.athleteId",
    });
  }
  if (state.timeline.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "Timeline athleteId inconsistency.",
      path: "timeline.athleteId",
    });
  }
  if (state.statistics.goalCount !== state.goals.items.length) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "statistics.goalCount does not match goals.items length.",
      path: "statistics.goalCount",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
