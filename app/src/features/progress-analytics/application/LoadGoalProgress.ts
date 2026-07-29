import { mapGoalProgress } from "../mappers";
import type { GoalProgress } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadGoalProgressDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadGoalProgress(deps: LoadGoalProgressDeps = {}): Promise<readonly GoalProgress[]> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getGoalProgress(deps.period);
  return mapGoalProgress(dto);
}
