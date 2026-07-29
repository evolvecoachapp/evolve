import { mapCoachInsight } from "../mappers";
import type { CoachInsightSummary, TimeRange } from "../models";
import { progressExperienceService, type ProgressExperienceService } from "../services";

export async function loadCoachInsights(input?: {
  readonly service?: ProgressExperienceService;
  readonly timeRange?: TimeRange;
}): Promise<readonly CoachInsightSummary[]> {
  const service = input?.service ?? progressExperienceService;
  const timeRange = input?.timeRange ?? "30d";
  return Object.freeze((await service.getCoachInsights(timeRange)).map(mapCoachInsight));
}
