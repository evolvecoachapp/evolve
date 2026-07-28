import { rebuildCoachExperience } from "../mappers";
import type { CoachExperience } from "../models/CoachExperience";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface DismissCoachInsightOptions {
  readonly service?: CoachExperienceService;
  readonly experience: CoachExperience;
  readonly insightId: string;
}

/** Dismisses an insight via Application → ExperienceService. */
export async function dismissCoachInsight({
  service = coachExperienceService,
  experience,
  insightId,
}: DismissCoachInsightOptions): Promise<CoachExperience> {
  await service.dismissInsight(insightId);

  return rebuildCoachExperience(experience, {
    dailyInsight:
      experience.dailyInsight?.id === insightId
        ? null
        : experience.dailyInsight,
    pinnedInsight:
      experience.pinnedInsight?.id === insightId
        ? null
        : experience.pinnedInsight,
  });
}
