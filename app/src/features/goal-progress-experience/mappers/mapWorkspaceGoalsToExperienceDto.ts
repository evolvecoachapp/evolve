import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import type { WorkspaceGoals } from "../../unified-workspace/models/WorkspaceGoals";
import type { GoalProgressDashboardDto } from "../services/GoalProgressExperienceService";

function buildEmptyDashboard(): GoalProgressDashboardDto {
  return Object.freeze({
    goalId: null,
    headline: "No goals yet",
    summary: "Set a training goal to start tracking progress.",
    category: null,
    currentValue: 0,
    targetValue: 100,
    unit: "percent",
    completionPercent: 0,
    status: "",
    milestones: Object.freeze([]),
    checkpoints: Object.freeze([]),
    updateAvailable: false,
    completeAvailable: false,
    isCompleted: false,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

function inferCompletionPercent(progress: GoalProgressDomain): number {
  return Math.max(0, Math.min(100, progress.evaluation.consistencyOrdinal));
}

export interface MapWorkspaceGoalsToExperienceDtoInput {
  readonly goals: WorkspaceGoals;
  readonly reachedMilestoneIds?: readonly string[];
  readonly isCompleted?: boolean;
}

/** Maps hydrated Unified Workspace goals into the Goal Progress Experience DTO. */
export function mapWorkspaceGoalsToExperienceDto(
  input: MapWorkspaceGoalsToExperienceDtoInput,
): GoalProgressDashboardDto {
  const { goals } = input;
  const progress = goals.goalProgress;
  const reachedMilestoneIds = new Set(input.reachedMilestoneIds ?? []);
  const isCompleted = input.isCompleted ?? false;

  if (!goals.present || !progress) {
    return buildEmptyDashboard();
  }

  const completionPercent = inferCompletionPercent(progress);
  const milestones = Object.freeze(
    progress.opportunities.map((milestone) =>
      Object.freeze({
        id: milestone.id,
        label: milestone.subjectId,
        category: milestone.category,
        reached: reachedMilestoneIds.has(milestone.id),
      }),
    ),
  );
  const checkpoints = Object.freeze(
    progress.candidates.map((checkpoint) =>
      Object.freeze({
        id: checkpoint.id,
        label: checkpoint.subjectId,
      }),
    ),
  );
  const pendingMilestones = milestones.filter((milestone) => !milestone.reached);

  return Object.freeze({
    goalId: progress.id,
    headline: progress.evaluation.subjectId,
    summary:
      goals.progressSummary ??
      goals.summary ??
      `Goal category: ${progress.category}`,
    category: progress.category,
    currentValue: completionPercent,
    targetValue: 100,
    unit: "percent",
    completionPercent,
    status: isCompleted ? "completed" : progress.severity.level,
    milestones,
    checkpoints,
    updateAvailable: !isCompleted,
    completeAvailable: !isCompleted && pendingMilestones.length === 0,
    isCompleted,
    historyDestination: "/(app)/(tabs)/progress",
  });
}

export type { GoalProgressDomain };
