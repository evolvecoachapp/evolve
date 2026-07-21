import {
  ATHLETE_GOAL_TYPES,
  type AthleteGoal,
} from "../models/AthleteGoal";
import type { AthleteContextValidationIssue } from "../models/AthleteContextValidationResult";

/**
 * Validate athlete goal structure.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateGoal(
  goal: AthleteGoal,
): readonly AthleteContextValidationIssue[] {
  const issues: AthleteContextValidationIssue[] = [];

  if (!(ATHLETE_GOAL_TYPES as readonly string[]).includes(goal.primary)) {
    issues.push(
      Object.freeze({
        field: "goal.primary",
        code: "invalid_goal" as const,
      }),
    );
  }

  if (
    goal.secondary !== null &&
    (!(ATHLETE_GOAL_TYPES as readonly string[]).includes(goal.secondary) ||
      goal.secondary === goal.primary)
  ) {
    issues.push(
      Object.freeze({
        field: "goal.secondary",
        code: "invalid_secondary_goal" as const,
      }),
    );
  }

  if (goal.targetDate !== null) {
    const parsed = Date.parse(goal.targetDate);
    if (Number.isNaN(parsed)) {
      issues.push(
        Object.freeze({
          field: "goal.targetDate",
          code: "invalid_goal_target_date" as const,
        }),
      );
    }
  }

  return Object.freeze(issues);
}
