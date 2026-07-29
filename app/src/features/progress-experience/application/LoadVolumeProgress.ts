import { mapVolumeProgress } from "../mappers";
import type { TimeRange, VolumeProgress } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadVolumeProgress(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<VolumeProgress> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapVolumeProgress(await service.getVolumeProgress(timeRange));
}
