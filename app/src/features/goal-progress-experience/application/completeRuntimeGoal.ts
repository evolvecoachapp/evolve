import { createGoalSnapshot } from "../../goal-progress/application";
import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import { GoalProgressInputKinds } from "../../goal-progress/models/GoalProgressInput";
import type { GoalSnapshot } from "../../goal-progress/models/GoalSnapshot";
import { mapGoalProgressDashboard, mapWorkspaceGoalsToExperienceDto } from "../mappers";
import type { GoalProgressDashboard } from "../models";
import { buildRuntimeGoalProgressInput } from "./buildRuntimeGoalProgressInput";
import { loadHydratedGoalProgressDomain } from "./loadHydratedGoalProgressExperience";

export interface CompleteRuntimeGoalInput {
  readonly dashboard: GoalProgressDashboard;
  readonly athleteId: string;
  readonly completedAt: string;
  readonly reachedMilestoneIds: readonly string[];
}

export interface CompleteRuntimeGoalResult {
  readonly dashboard: GoalProgressDashboard;
  readonly snapshot: GoalSnapshot | null;
  readonly progress: GoalProgressDomain | null;
}

/** Completes a goal through existing Goal Progress Engine snapshot API. */
export function completeRuntimeGoal(
  input: CompleteRuntimeGoalInput,
): CompleteRuntimeGoalResult {
  const progress = loadHydratedGoalProgressDomain(input.athleteId);
  if (!progress) {
    return Object.freeze({
      dashboard: input.dashboard,
      snapshot: null,
      progress: null,
    });
  }

  const result = createGoalSnapshot({
    input: buildRuntimeGoalProgressInput({
      progress,
      evaluatedAt: input.completedAt,
      kind: GoalProgressInputKinds.SNAPSHOT,
    }),
  });

  const snapshot = result.snapshot;
  const dto = mapWorkspaceGoalsToExperienceDto({
    goals: Object.freeze({
      athleteId: input.athleteId,
      present: true,
      goalProgress: progress,
      goalId: progress.id,
      category: progress.category,
      progressSummary: input.dashboard.summary,
      severity: "completed",
      milestoneIds: Object.freeze(progress.opportunities.map((item) => item.id)),
      summary: "Goal completed.",
    }),
    reachedMilestoneIds: input.reachedMilestoneIds,
    isCompleted: true,
  });

  return Object.freeze({
    dashboard: mapGoalProgressDashboard(dto),
    snapshot,
    progress,
  });
}
