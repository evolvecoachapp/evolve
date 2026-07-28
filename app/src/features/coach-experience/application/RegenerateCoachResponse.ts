import { mapCoachMessage, rebuildCoachExperience } from "../mappers";
import type { CoachExperience } from "../models/CoachExperience";
import { createCoachConversation } from "../models/CoachConversation";
import {
  CoachConversationStatuses,
  createCoachConversationState,
} from "../models/CoachConversationState";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface RegenerateCoachResponseOptions {
  readonly service?: CoachExperienceService;
  readonly experience: CoachExperience;
  readonly messageId: string;
}

/** Regenerates a coach message via Application → ExperienceService. */
export async function regenerateCoachResponse({
  service = coachExperienceService,
  experience,
  messageId,
}: RegenerateCoachResponseOptions): Promise<CoachExperience> {
  const regenerated = mapCoachMessage(
    await service.regenerateResponse({
      conversationId: experience.conversation.id,
      messageId,
    }),
  );

  const messages = experience.conversation.messages.map((message) =>
    message.id === messageId ? regenerated : message,
  );

  const conversation = createCoachConversation({
    id: experience.conversation.id,
    title: experience.conversation.title,
    messages,
    state: createCoachConversationState(CoachConversationStatuses.READY),
    createdAt: experience.conversation.createdAt,
    updatedAt: regenerated.createdAt,
    historyDestination: experience.conversation.historyDestination,
    settingsDestination: experience.conversation.settingsDestination,
  });

  return rebuildCoachExperience(experience, { conversation });
}
