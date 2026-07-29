import { mapStrengthProgress } from "../mappers";
import type { StrengthProgress, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadStrengthProgress(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<StrengthProgress> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapStrengthProgress(await service.getStrengthProgress(timeRange));
}
