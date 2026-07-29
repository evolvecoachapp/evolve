import { mapAnalyticsSnapshot } from "../mappers";
import type { AnalyticsSnapshot } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadAnalyticsSnapshotDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadAnalyticsSnapshot(deps: LoadAnalyticsSnapshotDeps = {}): Promise<AnalyticsSnapshot> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getAnalyticsSnapshot(deps.period);
  return mapAnalyticsSnapshot(dto);
}
