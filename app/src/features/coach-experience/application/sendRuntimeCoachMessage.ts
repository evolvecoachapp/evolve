import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { processCoachConversationTurn } from "../../coach-conversation/application";
import type { CoachConversationResult } from "../../coach-conversation/models/CoachConversationResult";
import type { CoachMessageDto } from "../types/coachExperienceDto";
import { buildRuntimeCoachConversationRequest } from "./buildRuntimeCoachConversationRequest";

export class CoachRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoachRuntimeError";
  }
}

export interface SendRuntimeCoachMessageInput {
  readonly athleteId: string;
  readonly conversationId: string;
  readonly message: string;
  readonly sessionId?: string | null;
  readonly createdAt: string;
  readonly requestId?: string;
}

export interface SendRuntimeCoachMessageResult {
  readonly userMessage: CoachMessageDto;
  readonly coachMessage: CoachMessageDto;
  readonly sessionId: string | null;
  readonly turnResult: CoachConversationResult;
}

/** Executes one coaching turn through existing Coach Conversation application API. */
export function sendRuntimeCoachMessage(
  input: SendRuntimeCoachMessageInput,
): SendRuntimeCoachMessageResult {
  const trimmed = input.message.trim();
  if (!trimmed) {
    throw new CoachRuntimeError("Coach message cannot be empty.");
  }

  const root = getCompositionRoot();
  const service = root.resolve("CoachConversationService");
  const turnResult = processCoachConversationTurn({
    service,
    request: buildRuntimeCoachConversationRequest({
      athleteId: input.athleteId,
      conversationId: input.conversationId,
      message: trimmed,
      sessionId: input.sessionId,
      createdAt: input.createdAt,
      requestId: input.requestId,
    }),
  });

  if (!turnResult.success || !turnResult.response) {
    throw new CoachRuntimeError(
      turnResult.errors.join("; ") || "Coach conversation turn failed.",
    );
  }

  const userMessage = Object.freeze({
    id: `user:${turnResult.id}`,
    role: "user" as const,
    content: trimmed,
    createdAt: input.createdAt,
  });

  const coachMessage = Object.freeze({
    id: turnResult.response.id,
    role: "coach" as const,
    content: turnResult.message,
    createdAt: turnResult.response.createdAt,
    citations: Object.freeze([...turnResult.response.topics]),
  });

  return Object.freeze({
    userMessage,
    coachMessage,
    sessionId: turnResult.sessionId,
    turnResult,
  });
}
