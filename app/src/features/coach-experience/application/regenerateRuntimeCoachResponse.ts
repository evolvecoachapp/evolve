import type { CoachExperience } from "../models/CoachExperience";
import type { CoachMessageDto } from "../types/coachExperienceDto";
import {
  CoachRuntimeError,
  sendRuntimeCoachMessage,
  type SendRuntimeCoachMessageResult,
} from "./sendRuntimeCoachMessage";

export interface RegenerateRuntimeCoachResponseInput {
  readonly experience: CoachExperience;
  readonly athleteId: string;
  readonly messageId: string;
  readonly sessionId?: string | null;
  readonly createdAt: string;
}

export interface RegenerateRuntimeCoachResponseResult
  extends SendRuntimeCoachMessageResult {
  readonly messages: readonly CoachMessageDto[];
}

/** Re-runs the preceding user turn through Coach Conversation orchestration. */
export function regenerateRuntimeCoachResponse(
  input: RegenerateRuntimeCoachResponseInput,
): RegenerateRuntimeCoachResponseResult {
  const messages = input.experience.conversation.messages;
  const targetIndex = messages.findIndex((message) => message.id === input.messageId);
  if (targetIndex < 0) {
    throw new CoachRuntimeError("Coach message not found for regeneration.");
  }

  const targetMessage = messages[targetIndex];
  if (targetMessage.role !== "coach") {
    throw new CoachRuntimeError("Only coach messages can be regenerated.");
  }

  const precedingUser = [...messages.slice(0, targetIndex)]
    .reverse()
    .find((message) => message.role === "user");
  if (!precedingUser) {
    throw new CoachRuntimeError("No user message found for regeneration.");
  }

  const priorMessages = messages.slice(0, targetIndex - 1).map((message) =>
    Object.freeze({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      citations: message.citations.length > 0 ? message.citations : undefined,
    }),
  );

  const turn = sendRuntimeCoachMessage({
    athleteId: input.athleteId,
    conversationId: input.experience.conversation.id,
    message: precedingUser.content,
    sessionId: input.sessionId ?? null,
    createdAt: input.createdAt,
    requestId: `coach-runtime-regen:${input.messageId}:${input.createdAt}`,
  });

  const nextMessages = Object.freeze([
    ...priorMessages,
    turn.userMessage,
    turn.coachMessage,
    ...messages.slice(targetIndex + 1).map((message) =>
      Object.freeze({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        citations: message.citations.length > 0 ? message.citations : undefined,
      }),
    ),
  ]);

  return Object.freeze({
    ...turn,
    messages: nextMessages,
  });
}
