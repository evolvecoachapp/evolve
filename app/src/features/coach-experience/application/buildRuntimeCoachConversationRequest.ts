import {
  EMPTY_COACH_CONVERSATION_METADATA,
  type CoachConversationRequest,
} from "../../coach-conversation/models";

export interface BuildRuntimeCoachConversationRequestInput {
  readonly athleteId: string;
  readonly conversationId: string;
  readonly message: string;
  readonly sessionId?: string | null;
  readonly requestId?: string;
  readonly createdAt: string;
}

/** Builds a Coach Conversation turn request for the runtime production path. */
export function buildRuntimeCoachConversationRequest(
  input: BuildRuntimeCoachConversationRequestInput,
): CoachConversationRequest {
  return Object.freeze({
    id: input.requestId ?? `coach-runtime-req:${input.createdAt}`,
    conversationId: input.conversationId,
    sessionId: input.sessionId ?? null,
    athleteId: input.athleteId,
    message: input.message.trim(),
    intentHint: null,
    metadata: EMPTY_COACH_CONVERSATION_METADATA,
    createdAt: input.createdAt,
  });
}
