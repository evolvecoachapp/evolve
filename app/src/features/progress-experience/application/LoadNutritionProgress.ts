import { mapNutritionProgress } from "../mappers";
import type { NutritionProgress, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadNutritionProgress(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<NutritionProgress> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return mapNutritionProgress(await service.getNutritionProgress(timeRange));
}
