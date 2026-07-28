import { loadCoachConversation } from "./LoadCoachConversation";
import type { CoachExperience } from "../models/CoachExperience";
import type { CoachExperienceService } from "../services";

export interface RefreshCoachExperienceOptions {
  readonly service?: CoachExperienceService;
}

/** Explicit refresh path — same mapping as load. */
export async function refreshCoachExperience(
  options: RefreshCoachExperienceOptions = {},
): Promise<CoachExperience> {
  return loadCoachConversation(options);
}
