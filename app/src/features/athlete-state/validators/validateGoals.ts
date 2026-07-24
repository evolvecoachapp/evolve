import type { AthleteGoals } from "../models/AthleteGoals";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateGoals(goals: AthleteGoals): StateValidation {
  const issues = [];
  const ids = new Set<string>();
  for (const item of goals.items) {
    if (!item.id || !item.title) {
      issues.push({
        code: StateValidationCodes.INVALID_GOALS,
        message: "Goal id and title are required.",
        path: "goals.items",
      });
    }
    if (ids.has(item.id)) {
      issues.push({
        code: StateValidationCodes.INVALID_GOALS,
        message: `Duplicate goal id: ${item.id}`,
        path: "goals.items",
      });
    }
    ids.add(item.id);
  }
  if (
    goals.primaryGoalId &&
    goals.items.length > 0 &&
    !ids.has(goals.primaryGoalId)
  ) {
    issues.push({
      code: StateValidationCodes.INVALID_GOALS,
      message: "primaryGoalId must reference an item.",
      path: "goals.primaryGoalId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
