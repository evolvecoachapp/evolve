import { mapWorkoutHistory } from "../mappers";
import type { WorkoutHistory } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadWorkoutHistoryDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadWorkoutHistory(deps: LoadWorkoutHistoryDeps = {}): Promise<WorkoutHistory> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getWorkoutHistory(deps.period);
  return mapWorkoutHistory(dto);
}
