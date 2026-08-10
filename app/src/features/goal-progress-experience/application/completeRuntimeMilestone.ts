import type { GoalMilestone } from "../../goal-progress/models/GoalMilestone";
import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import { mapGoalProgressDashboard, mapWorkspaceGoalsToExperienceDto } from "../mappers";
import type { GoalProgressDashboard } from "../models";
import { loadHydratedGoalProgressDomain } from "./loadHydratedGoalProgressExperience";

export interface CompleteRuntimeMilestoneInput {
  readonly dashboard: GoalProgressDashboard;
  readonly athleteId: string;
  readonly milestoneId: string;
  readonly reachedMilestoneIds: readonly string[];
}

export interface CompleteRuntimeMilestoneResult {
  readonly dashboard: GoalProgressDashboard;
  readonly milestone: GoalMilestone | null;
  readonly progress: GoalProgressDomain | null;
}

/** Marks a milestone reached in runtime-driven goal progress state. */
export function completeRuntimeMilestone(
  input: CompleteRuntimeMilestoneInput,
): CompleteRuntimeMilestoneResult {
  const progress = loadHydratedGoalProgressDomain(input.athleteId);
  const milestone =
    progress?.opportunities.find((item) => item.id === input.milestoneId) ?? null;

  if (!milestone || !progress) {
    return Object.freeze({
      dashboard: input.dashboard,
      milestone: null,
      progress,
    });
  }

  const reachedMilestoneIds = Object.freeze([
    ...new Set([...input.reachedMilestoneIds, input.milestoneId]),
  ]);

  const dto = mapWorkspaceGoalsToExperienceDto({
    goals: Object.freeze({
      athleteId: input.athleteId,
      present: true,
      goalProgress: progress,
      goalId: progress.id,
      category: progress.category,
      progressSummary: input.dashboard.summary,
      severity: progress.severity.level,
      milestoneIds: Object.freeze(progress.opportunities.map((item) => item.id)),
      summary: input.dashboard.summary,
    }),
    reachedMilestoneIds,
    isCompleted: input.dashboard.isCompleted,
  });

  return Object.freeze({
    dashboard: mapGoalProgressDashboard(dto),
    milestone,
    progress,
  });
}
