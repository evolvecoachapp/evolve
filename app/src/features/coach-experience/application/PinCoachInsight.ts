import { mapCoachInsight, rebuildCoachExperience } from "../mappers";
import type { CoachExperience } from "../models/CoachExperience";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface PinCoachInsightOptions {
  readonly service?: CoachExperienceService;
  readonly experience: CoachExperience;
  readonly insightId: string;
}

/** Pins an insight via Application → ExperienceService. */
export async function pinCoachInsight({
  service = coachExperienceService,
  experience,
  insightId,
}: PinCoachInsightOptions): Promise<CoachExperience> {
  const pinned = mapCoachInsight(await service.pinInsight(insightId));
  const dailyInsight =
    experience.dailyInsight?.id === insightId
      ? mapCoachInsight({
          id: experience.dailyInsight.id,
          kind: experience.dailyInsight.kind,
          title: experience.dailyInsight.title,
          body: experience.dailyInsight.body,
          severity: experience.dailyInsight.severity,
          pinned: true,
          dismissed: experience.dailyInsight.dismissed,
          createdAt: experience.dailyInsight.createdAt,
        })
      : experience.dailyInsight;

  return rebuildCoachExperience(experience, {
    pinnedInsight: pinned,
    dailyInsight,
  });
}
