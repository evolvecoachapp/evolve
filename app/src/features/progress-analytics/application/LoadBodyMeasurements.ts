import { mapBodyMeasurements } from "../mappers";
import type { BodyMeasurement } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadBodyMeasurementsDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadBodyMeasurements(deps: LoadBodyMeasurementsDeps = {}): Promise<readonly BodyMeasurement[]> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getBodyMeasurements(deps.period);
  return mapBodyMeasurements(dto);
}
