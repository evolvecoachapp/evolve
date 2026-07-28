export const CoachTypingStatuses = {
  IDLE: "idle",
  TYPING: "typing",
  STREAMING: "streaming",
} as const;

export type CoachTypingStatus =
  (typeof CoachTypingStatuses)[keyof typeof CoachTypingStatuses];

/**
 * Immutable typing / streaming indicator state — prepared for live streaming.
 * Presentation only; no provider-specific logic.
 */
export interface CoachTypingState {
  readonly status: CoachTypingStatus;
  readonly isTyping: boolean;
  readonly isStreaming: boolean;
  readonly visible: boolean;
}

export function createCoachTypingState(
  status: CoachTypingStatus = CoachTypingStatuses.IDLE,
): CoachTypingState {
  const isTyping = status === CoachTypingStatuses.TYPING;
  const isStreaming = status === CoachTypingStatuses.STREAMING;
  return Object.freeze({
    status,
    isTyping,
    isStreaming,
    visible: isTyping || isStreaming,
  });
}
