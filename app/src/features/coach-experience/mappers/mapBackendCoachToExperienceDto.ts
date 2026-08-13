import type { ChatMessagePageDto, ChatMessageReadDto, ChatRoleDto, CoachMessageReadDto } from "../../../types/api";
import type {
  CoachExperienceDto,
  CoachMessageDto,
  CoachSendMessageResultDto,
} from "../types/coachExperienceDto";

/**
 * Maps Coach API DTOs onto the Coach Experience read model.
 *
 * Only projects fields the backend actually returns. Insights, recommendations,
 * quick actions, memory, and conversation-list history have no Coach API
 * surface and stay empty rather than invented.
 */

export const BACKEND_PENDING_CONVERSATION_ID = "pending";
export const BACKEND_COACH_CONVERSATION_TITLE = "Coach";

function mapChatRoleToExperienceRole(
  role: ChatRoleDto,
): CoachMessageDto["role"] {
  switch (role) {
    case "user":
      return "user";
    case "system":
      return "system";
    case "assistant":
    default:
      return "coach";
  }
}

export function mapBackendChatMessageToCoachMessageDto(
  message: ChatMessageReadDto,
): CoachMessageDto {
  return Object.freeze({
    id: message.id,
    role: mapChatRoleToExperienceRole(message.role),
    content: message.content,
    createdAt: message.created_at,
  });
}

export function buildEmptyBackendCoachExperience(
  createdAt = "1970-01-01T00:00:00.000Z",
): CoachExperienceDto {
  return Object.freeze({
    conversation: Object.freeze({
      id: BACKEND_PENDING_CONVERSATION_ID,
      title: BACKEND_COACH_CONVERSATION_TITLE,
      messages: Object.freeze([]),
      createdAt,
      updatedAt: createdAt,
      empty: true,
    }),
    dailyInsight: null,
    pinnedInsight: null,
    recommendations: Object.freeze([]),
    quickActions: Object.freeze([]),
    memorySummary: null,
    conversationHistory: Object.freeze([]),
    empty: true,
  });
}

export interface MapBackendCoachMessagesToExperienceDtoInput {
  readonly conversationId: string;
  readonly page: ChatMessagePageDto;
}

/** Maps a persisted conversation page into the Experience aggregate DTO. */
export function mapBackendCoachMessagesToExperienceDto(
  input: MapBackendCoachMessagesToExperienceDtoInput,
): CoachExperienceDto {
  const messages = Object.freeze(
    input.page.items.map(mapBackendChatMessageToCoachMessageDto),
  );
  const first = input.page.items[0];
  const last = input.page.items[input.page.items.length - 1];
  const createdAt = first?.created_at ?? "1970-01-01T00:00:00.000Z";
  const updatedAt = last?.created_at ?? createdAt;
  const empty = messages.length === 0;

  return Object.freeze({
    conversation: Object.freeze({
      id: input.conversationId,
      title: BACKEND_COACH_CONVERSATION_TITLE,
      messages,
      createdAt,
      updatedAt,
      empty,
    }),
    dailyInsight: null,
    pinnedInsight: null,
    recommendations: Object.freeze([]),
    quickActions: Object.freeze([]),
    memorySummary: null,
    conversationHistory: Object.freeze([]),
    empty,
  });
}

export interface MapBackendCoachReplyToSendResultInput {
  readonly reply: CoachMessageReadDto;
  readonly userContent: string;
  readonly createdAt: string;
}

/**
 * Maps `POST /messages` (coach reply only) plus the sent user text into the
 * Experience send-result DTO. Only `reply.message` becomes visible coach
 * content — intent, engines_invoked, and artifacts stay off the chat bubble.
 * The reply schema has no message ids or timestamps — those are filled from
 * `createdAt` rather than invented backend fields.
 */
export function mapBackendCoachReplyToSendResult(
  input: MapBackendCoachReplyToSendResultInput,
): CoachSendMessageResultDto {
  const { reply, userContent, createdAt } = input;

  const userMessage: CoachMessageDto = Object.freeze({
    id: `user-${reply.conversation_id}-${createdAt}`,
    role: "user",
    content: userContent,
    createdAt,
  });
  const coachMessage: CoachMessageDto = Object.freeze({
    id: `coach-${reply.conversation_id}-${createdAt}`,
    role: "coach",
    content: reply.message,
    createdAt,
  });

  return Object.freeze({
    conversationId: reply.conversation_id,
    userMessage,
    coachMessage,
  });
}
