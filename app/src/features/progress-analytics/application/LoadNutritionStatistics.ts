import { mapNutritionStatistics } from "../mappers";
import type { NutritionStatistics } from "../models";
import { progressAnalyticsService, type AnalyticsPeriodDto, type ProgressAnalyticsService } from "../services";

export interface LoadNutritionStatisticsDeps {
  readonly service?: ProgressAnalyticsService;
  readonly period?: AnalyticsPeriodDto;
}

export async function loadNutritionStatistics(deps: LoadNutritionStatisticsDeps = {}): Promise<NutritionStatistics> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getNutritionStatistics(deps.period);
  return mapNutritionStatistics(dto);
}
