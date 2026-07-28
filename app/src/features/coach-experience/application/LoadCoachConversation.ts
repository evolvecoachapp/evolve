import { mapCoachExperience } from "../mappers";
import type { CoachExperience } from "../models/CoachExperience";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface LoadCoachConversationOptions {
  readonly service?: CoachExperienceService;
}

/** Loads the Coach conversation via Application → ExperienceService. */
export async function loadCoachConversation({
  service = coachExperienceService,
}: LoadCoachConversationOptions = {}): Promise<CoachExperience> {
  const dto = await service.getExperience();
  return mapCoachExperience(dto);
}
