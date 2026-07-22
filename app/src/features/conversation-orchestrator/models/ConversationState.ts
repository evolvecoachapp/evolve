/**
 * Deterministic conversation orchestration state.
 * Lifecycle metadata only — not a live chat runtime.
 */
export const ConversationStates = {
  IDLE: "idle",
  PREPARING: "preparing",
  READY: "ready",
  AWAITING_RESPONSE: "awaiting_response",
  CLOSED: "closed",
} as const;

export type ConversationState =
  (typeof ConversationStates)[keyof typeof ConversationStates];

export const ALL_CONVERSATION_STATES: readonly ConversationState[] =
  Object.freeze([
    ConversationStates.IDLE,
    ConversationStates.PREPARING,
    ConversationStates.READY,
    ConversationStates.AWAITING_RESPONSE,
    ConversationStates.CLOSED,
  ]);
