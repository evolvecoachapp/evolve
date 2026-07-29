import { mapPersonalRecords } from "../mappers";
import type { PersonalRecord } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadPersonalRecordsDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadPersonalRecords(deps: LoadPersonalRecordsDeps = {}): Promise<readonly PersonalRecord[]> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getPersonalRecords(deps.period);
  return mapPersonalRecords(dto);
}
