import { mapGoalProgressDashboard } from "../mappers";
import type { GoalProgressDashboard } from "../models";
import type { GoalProgressExperienceService } from "../services";

export interface RefreshGoalProgressDashboardDeps {
  readonly service: GoalProgressExperienceService;
}

export async function refreshGoalProgressDashboard(
  deps: RefreshGoalProgressDashboardDeps,
): Promise<GoalProgressDashboard> {
  const dto = await deps.service.getDashboard();
  return mapGoalProgressDashboard(dto);
}
