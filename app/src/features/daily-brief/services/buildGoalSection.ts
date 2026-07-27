import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";

export interface BuildGoalSectionInput {
  readonly goalProgress?: GoalProgress | null;
}

/**
 * Compose Daily Brief goals section from Goal Progress.
 * No duplicated goal evaluation logic.
 */
export function buildGoalSection(
  input: BuildGoalSectionInput = {},
): DailyBriefGoals {
  const goal = input.goalProgress ?? null;

  if (!goal) {
    return Object.freeze({
      present: false,
      goalId: null,
      category: null,
      progressSummary: null,
      milestones: Object.freeze([]),
      severity: null,
      summary: "No goal progress available.",
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

  const progressSummary = [
    `Priority ${goal.priority.label}`,
    `Severity ${goal.severity.level}`,
    `${goal.candidates.length} checkpoints`,
    `${milestones.length} milestones`,
  ].join(" · ");

  return Object.freeze({
    present: true,
    goalId: goal.id,
    category: goal.category,
    progressSummary,
    milestones,
    severity: goal.severity.level,
    summary: progressSummary,
  });
}
