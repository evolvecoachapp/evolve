import { mapRecoveryProgress } from "../mappers";
import type { RecoveryProgress, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadRecoveryProgress(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<RecoveryProgress> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapRecoveryProgress(await service.getRecoveryProgress(timeRange));
}
