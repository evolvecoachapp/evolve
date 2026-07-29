import { mapProgressDashboard } from "../mappers";
import type { ProgressDashboard, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadProgressDashboard(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<ProgressDashboard> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapProgressDashboard(await service.getDashboard(timeRange));
}
