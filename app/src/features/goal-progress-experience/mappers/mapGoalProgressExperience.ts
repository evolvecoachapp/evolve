import {
  createGoalCheckpointItem,
  createGoalMilestoneItem,
  createGoalProgressDashboard,
  type GoalProgressDashboard,
} from "../models";
import type { GoalProgressDashboardDto } from "../services";

export function mapGoalMilestones(
  milestones: GoalProgressDashboardDto["milestones"],
): GoalProgressDashboard["milestones"] {
  return Object.freeze(
    milestones.map((milestone) =>
      createGoalMilestoneItem({
        id: milestone.id,
        label: milestone.label,
        category: milestone.category,
        reached: milestone.reached,
      }),
    ),
  );
}

export function mapGoalCheckpoints(
  checkpoints: GoalProgressDashboardDto["checkpoints"],
): GoalProgressDashboard["checkpoints"] {
  return Object.freeze(
    checkpoints.map((checkpoint) =>
      createGoalCheckpointItem({
        id: checkpoint.id,
        label: checkpoint.label,
      }),
    ),
  );
}

export function mapGoalProgressDashboard(dto: GoalProgressDashboardDto): GoalProgressDashboard {
  return createGoalProgressDashboard({
    goalId: dto.goalId,
    headline: dto.headline,
    summary: dto.summary,
    category: dto.category,
    currentValue: dto.currentValue,
    targetValue: dto.targetValue,
    unit: dto.unit,
    completionPercent: dto.completionPercent,
    status: dto.status,
    milestones: mapGoalMilestones(dto.milestones),
    checkpoints: mapGoalCheckpoints(dto.checkpoints),
    updateAvailable: dto.updateAvailable,
    completeAvailable: dto.completeAvailable,
    isCompleted: dto.isCompleted,
    historyDestination: dto.historyDestination ?? "/(app)/(tabs)/progress",
  });
}

export { mapWorkspaceGoalsToExperienceDto } from "./mapWorkspaceGoalsToExperienceDto";
