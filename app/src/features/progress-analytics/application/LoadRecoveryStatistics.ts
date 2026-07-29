import { mapRecoveryStatistics } from "../mappers";
import type { RecoveryStatistics } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadRecoveryStatisticsDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadRecoveryStatistics(deps: LoadRecoveryStatisticsDeps = {}): Promise<RecoveryStatistics> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getRecoveryStatistics(deps.period);
  return mapRecoveryStatistics(dto);
}
