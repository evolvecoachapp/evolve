import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeGoalCard } from "../models/HomeGoalCard";

export interface BuildGoalCardInput {
  readonly goalProgress?: GoalProgress | null;
}

/**
 * Compose Home goal card from Goal Progress.
 * No duplicated goal evaluation logic.
 */
export function buildGoalCard(
  input: BuildGoalCardInput = {},
): HomeGoalCard {
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
