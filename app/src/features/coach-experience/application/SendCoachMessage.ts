import {
  mapCoachMessage,
  rebuildCoachExperience,
} from "../mappers";
import type { CoachExperience } from "../models/CoachExperience";
import {
  createCoachConversation,
} from "../models/CoachConversation";
import {
  CoachConversationStatuses,
  createCoachConversationState,
} from "../models/CoachConversationState";
import {
  coachExperienceService,
  type CoachExperienceService,
} from "../services";

export interface SendCoachMessageOptions {
  readonly service?: CoachExperienceService;
  readonly experience: CoachExperience;
  readonly message: string;
}

/** Sends a user message and appends the coach reply into the experience. */
export async function sendCoachMessage({
  service = coachExperienceService,
  experience,
  message,
}: SendCoachMessageOptions): Promise<CoachExperience> {
  const trimmed = message.trim();
  if (!trimmed) {
    return experience;
  }

  const result = await service.sendMessage({
    conversationId: experience.conversation.id,
    message: trimmed,
  });

  const userMessage = mapCoachMessage(result.userMessage);
  const coachMessage = mapCoachMessage(result.coachMessage);
  const now = coachMessage.createdAt;

  const conversation = createCoachConversation({
    id: experience.conversation.id,
    title: experience.conversation.title,
    messages: [
      ...experience.conversation.messages,
      userMessage,
      coachMessage,
    ],
    state: createCoachConversationState(CoachConversationStatuses.READY),
    createdAt: experience.conversation.createdAt,
    updatedAt: now,
    historyDestination: experience.conversation.historyDestination,
    settingsDestination: experience.conversation.settingsDestination,
  });

  return rebuildCoachExperience(experience, { conversation });
}
