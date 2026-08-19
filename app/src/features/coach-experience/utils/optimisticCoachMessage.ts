import { createCoachConversation } from "../models/CoachConversation";
import {
  CoachConversationStatuses,
  createCoachConversationState,
} from "../models/CoachConversationState";
import type { CoachExperience } from "../models/CoachExperience";
import {
  CoachMessageRoles,
  CoachMessageStatuses,
  createCoachMessage,
  type CoachMessage,
  type CoachMessageStatus,
} from "../models/CoachMessage";
import { rebuildCoachExperience } from "../mappers/mapCoachExperience";

export function createPendingUserMessage(input: {
  readonly content: string;
  readonly createdAt: string;
}): CoachMessage {
  return createCoachMessage({
    id: `pending:user:${input.createdAt}`,
    role: CoachMessageRoles.USER,
    content: input.content,
    createdAt: input.createdAt,
    status: CoachMessageStatuses.PENDING,
    markdownReady: false,
  });
}

export function appendOptimisticUserMessage(
  experience: CoachExperience,
  message: CoachMessage,
): CoachExperience {
  return rebuildCoachExperience(experience, {
    conversation: createCoachConversation({
      id: experience.conversation.id,
      title: experience.conversation.title,
      messages: [...experience.conversation.messages, message],
      state: createCoachConversationState(
        CoachConversationStatuses.AWAITING_REPLY,
      ),
      createdAt: experience.conversation.createdAt,
      updatedAt: message.createdAt,
      historyDestination: experience.conversation.historyDestination,
      settingsDestination: experience.conversation.settingsDestination,
    }),
  });
}

export function markCoachMessageStatus(
  experience: CoachExperience,
  messageId: string,
  status: CoachMessageStatus,
): CoachExperience {
  return rebuildCoachExperience(experience, {
    conversation: createCoachConversation({
      id: experience.conversation.id,
      title: experience.conversation.title,
      messages: experience.conversation.messages.map((message) =>
        message.id === messageId
          ? createCoachMessage({
              id: message.id,
              role: message.role,
              content: message.content,
              createdAt: message.createdAt,
              status,
              markdownReady: message.markdownReady,
              citations: message.citations,
            })
          : message,
      ),
      state: createCoachConversationState(
        status === CoachMessageStatuses.ERROR
          ? CoachConversationStatuses.ERROR
          : experience.conversation.state.status,
      ),
      createdAt: experience.conversation.createdAt,
      updatedAt: experience.conversation.updatedAt,
      historyDestination: experience.conversation.historyDestination,
      settingsDestination: experience.conversation.settingsDestination,
    }),
  });
}
