import { mapStrengthProgress } from "../mappers";
import type { StrengthProgress } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadStrengthProgressDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadStrengthProgress(deps: LoadStrengthProgressDeps = {}): Promise<StrengthProgress> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getStrengthProgress(deps.period);
  return mapStrengthProgress(dto);
}
