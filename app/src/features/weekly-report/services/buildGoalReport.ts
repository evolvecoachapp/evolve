import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";

export interface BuildGoalReportInput {
  readonly goalProgress?: GoalProgress | null;
}

/**
 * Compose Weekly Coach Report goal section from Goal Progress.
 * No duplicated goal evaluation logic.
 */
export function buildGoalReport(
  input: BuildGoalReportInput = {},
): WeeklyGoalReport {
  const goal = input.goalProgress ?? null;

  if (!goal) {
    return Object.freeze({
      present: false,
      goalId: null,
      category: null,
      progressSummary: null,
      milestones: Object.freeze([]),
      remainingObjectiveCount: 0,
      severity: null,
      summary: "No goal progress this week.",
    });
  }

  const milestones = Object.freeze(
    goal.opportunities.map((m) =>
      Object.freeze({
        id: m.id,
        category: m.category,
        subjectId: m.subjectId,
      }),
    ),
  );

  const remainingObjectiveCount = goal.candidates.length;
  const progressSummary = [
    `Priority ${goal.priority.label}`,
    `Severity ${goal.severity.level}`,
    `${remainingObjectiveCount} remaining objective(s)`,
    `${milestones.length} milestone(s)`,
  ].join(" · ");

  return Object.freeze({
    present: true,
    goalId: goal.id,
    category: goal.category,
    progressSummary,
    milestones,
    remainingObjectiveCount,
    severity: goal.severity.level,
    summary: progressSummary,
  });
}
