export const CoachConversationStatuses = {
  IDLE: "idle",
  READY: "ready",
  AWAITING_REPLY: "awaiting_reply",
  STREAMING: "streaming",
  EMPTY: "empty",
  ERROR: "error",
} as const;

export type CoachConversationStatus =
  (typeof CoachConversationStatuses)[keyof typeof CoachConversationStatuses];

/** Immutable conversation state — presentation only. */
export interface CoachConversationState {
  readonly status: CoachConversationStatus;
  readonly isIdle: boolean;
  readonly isReady: boolean;
  readonly isAwaitingReply: boolean;
  readonly isStreaming: boolean;
  readonly isEmpty: boolean;
  readonly hasError: boolean;
}

export function createCoachConversationState(
  status: CoachConversationStatus,
): CoachConversationState {
  return Object.freeze({
    status,
    isIdle: status === CoachConversationStatuses.IDLE,
    isReady: status === CoachConversationStatuses.READY,
    isAwaitingReply: status === CoachConversationStatuses.AWAITING_REPLY,
    isStreaming: status === CoachConversationStatuses.STREAMING,
    isEmpty: status === CoachConversationStatuses.EMPTY,
    hasError: status === CoachConversationStatuses.ERROR,
  });
}
