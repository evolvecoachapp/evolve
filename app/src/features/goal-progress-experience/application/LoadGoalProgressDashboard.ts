import { mapGoalProgressDashboard } from "../mappers";
import type { GoalProgressDashboard } from "../models";
import type { GoalProgressExperienceService } from "../services";

export interface LoadGoalProgressDashboardDeps {
  readonly service: GoalProgressExperienceService;
}

export async function loadGoalProgressDashboard(
  deps: LoadGoalProgressDashboardDeps,
): Promise<GoalProgressDashboard> {
  const dto = await deps.service.getDashboard();
  return mapGoalProgressDashboard(dto);
}
