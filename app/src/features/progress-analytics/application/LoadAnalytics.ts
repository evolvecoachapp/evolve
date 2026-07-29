import { mapProgressAnalyticsData, type ProgressAnalyticsData } from "../mappers";
import { progressAnalyticsService, type AnalyticsFilterDto, type ProgressAnalyticsService } from "../services";

export interface LoadAnalyticsDeps {
  readonly service?: ProgressAnalyticsService;
  readonly filter?: AnalyticsFilterDto;
}

export async function loadAnalytics(deps: LoadAnalyticsDeps = {}): Promise<ProgressAnalyticsData> {
  const service = deps.service ?? progressAnalyticsService;
  const dto = await service.getAnalytics(deps.filter);
  return mapProgressAnalyticsData(dto);
}
