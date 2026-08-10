import { evaluateGoalProgress } from "../../goal-progress/application";
import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import { mapGoalProgressDashboard, mapWorkspaceGoalsToExperienceDto } from "../mappers";
import type { GoalProgressDashboard } from "../models";
import { buildRuntimeGoalProgressInput } from "./buildRuntimeGoalProgressInput";
import { loadHydratedGoalProgressDomain } from "./loadHydratedGoalProgressExperience";

export interface UpdateRuntimeGoalProgressInput {
  readonly dashboard: GoalProgressDashboard;
  readonly athleteId: string;
  readonly evaluatedAt: string;
  readonly reachedMilestoneIds: readonly string[];
}

export interface UpdateRuntimeGoalProgressResult {
  readonly dashboard: GoalProgressDashboard;
  readonly progress: GoalProgressDomain | null;
}

/** Re-evaluates goal progress through existing Goal Progress Engine application API. */
export function updateRuntimeGoalProgress(
  input: UpdateRuntimeGoalProgressInput,
): UpdateRuntimeGoalProgressResult {
  const domain = loadHydratedGoalProgressDomain(input.athleteId);
  if (!domain) {
    return Object.freeze({
      dashboard: input.dashboard,
      progress: null,
    });
  }

  const result = evaluateGoalProgress({
    input: buildRuntimeGoalProgressInput({
      progress: domain,
      evaluatedAt: input.evaluatedAt,
    }),
  });

  const updated = result.decisions[0] ?? domain;
  const dto = mapWorkspaceGoalsToExperienceDto({
    goals: Object.freeze({
      athleteId: input.athleteId,
      present: true,
      goalProgress: updated,
      goalId: updated.id,
      category: updated.category,
      progressSummary: input.dashboard.summary,
      severity: updated.severity.level,
      milestoneIds: Object.freeze(input.dashboard.milestones.map((item) => item.id)),
      summary: input.dashboard.summary,
    }),
    reachedMilestoneIds: input.reachedMilestoneIds,
    isCompleted: input.dashboard.isCompleted,
  });

  return Object.freeze({
    dashboard: mapGoalProgressDashboard(dto),
    progress: updated,
  });
}
