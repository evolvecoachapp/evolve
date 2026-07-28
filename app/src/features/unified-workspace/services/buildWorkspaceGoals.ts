import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceGoals } from "../models/WorkspaceGoals";

export interface BuildWorkspaceGoalsInput {
  readonly athleteId: string;
  readonly goalProgress?: GoalProgress | null;
  readonly homeExperience?: HomeExperience | null;
}

/**
 * Builds goals projection from Goal Progress and Home goal card.
 */
export function buildWorkspaceGoals(
  input: BuildWorkspaceGoalsInput,
): WorkspaceGoals {
  const goalProgress = input.goalProgress ?? null;
  const goalCard = input.homeExperience?.goal ?? null;
  const milestoneIds = Object.freeze([
    ...(goalProgress?.opportunities.map((item) => item.id) ?? []),
    ...(goalCard?.milestones.map((item) => item.id) ?? []),
  ]);
  const uniqueMilestoneIds = Object.freeze(Array.from(new Set(milestoneIds)));
  const present = goalProgress != null || goalCard?.present === true;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    goalProgress,
    goalId: goalProgress?.id ?? goalCard?.goalId ?? null,
    category: goalProgress?.category ?? goalCard?.category ?? null,
    progressSummary: goalCard?.progressSummary ?? null,
    severity: goalProgress?.severity.level ?? goalCard?.severity ?? null,
    milestoneIds: uniqueMilestoneIds,
    summary:
      goalCard?.summary ??
      (goalProgress?.category
        ? `Goal category: ${goalProgress.category}`
        : "No goal progress is currently available."),
  });
}
