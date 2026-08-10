import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { GoalProgress as GoalProgressDomain } from "../../goal-progress/models/GoalProgress";
import { mapGoalProgressDashboard } from "../mappers";
import { mapWorkspaceGoalsToExperienceDto } from "../mappers/mapWorkspaceGoalsToExperienceDto";
import type { GoalProgressDashboard } from "../models";

export interface LoadHydratedGoalProgressExperienceOptions {
  readonly athleteId: string;
  readonly reachedMilestoneIds?: readonly string[];
  readonly isCompleted?: boolean;
}

/**
 * Loads goal progress experience from hydrated Unified Workspace.
 */
export async function loadHydratedGoalProgressExperience({
  athleteId,
  reachedMilestoneIds,
  isCompleted,
}: LoadHydratedGoalProgressExperienceOptions): Promise<GoalProgressDashboard | null> {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  if (!workspace) {
    return null;
  }

  const dto = mapWorkspaceGoalsToExperienceDto({
    goals: workspace.goals,
    reachedMilestoneIds,
    isCompleted,
  });

  return mapGoalProgressDashboard(dto);
}

export function loadHydratedGoalProgressDomain(athleteId: string): GoalProgressDomain | null {
  const root = getCompositionRoot();
  const workspace = root.resolve("UnifiedWorkspaceService").getWorkspace(athleteId);
  return workspace?.goals.goalProgress ?? null;
}
