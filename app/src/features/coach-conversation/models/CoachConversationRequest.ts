import type { CoachConversationIntent } from "./CoachConversationIntent";

export interface CoachConversationRequestMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_COACH_CONVERSATION_METADATA: CoachConversationRequestMetadata =
  Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({} as Record<string, string>),
  });

/**
 * Immutable request for a coaching conversation turn.
 */
export interface CoachConversationRequest {
  readonly id: string;
  readonly conversationId: string;
  readonly sessionId: string | null;
  readonly athleteId: string;
  readonly message: string;
  /** Optional pre-routed intent; when null, intent is inferred deterministically. */
  readonly intentHint: CoachConversationIntent | null;
  readonly metadata: CoachConversationRequestMetadata;
  readonly createdAt: string;
}
