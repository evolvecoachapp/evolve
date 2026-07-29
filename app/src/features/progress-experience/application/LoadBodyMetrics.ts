import { mapBodyMetrics } from "../mappers";
import type { BodyMetrics, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadBodyMetrics(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<BodyMetrics> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapBodyMetrics(await service.getBodyMetrics(timeRange));
}
