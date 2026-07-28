import { mapCoachInsight } from "../mappers";
import type { CoachInsight } from "../models/CoachInsight";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface LoadDailyInsightOptions {
  readonly service?: CoachExperienceService;
}

/** Loads today's daily insight via Application → ExperienceService. */
export async function loadDailyInsight({
  service = coachExperienceService,
}: LoadDailyInsightOptions = {}): Promise<CoachInsight | null> {
  const dto = await service.getDailyInsight();
  return dto ? mapCoachInsight(dto) : null;
}
