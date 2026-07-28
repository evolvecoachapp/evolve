import { mapCoachConversationHistoryItem } from "../mappers";
import type { CoachConversationHistoryItem } from "../models/CoachExperience";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface LoadConversationHistoryOptions {
  readonly service?: CoachExperienceService;
}

/** Loads conversation history list via Application → ExperienceService. */
export async function loadConversationHistory({
  service = coachExperienceService,
}: LoadConversationHistoryOptions = {}): Promise<
  readonly CoachConversationHistoryItem[]
> {
  const dto = await service.getConversationHistory();
  return Object.freeze(dto.map(mapCoachConversationHistoryItem));
}
