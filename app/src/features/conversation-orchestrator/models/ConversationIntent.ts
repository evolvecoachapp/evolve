/**
 * Deterministic conversation intent codes.
 * Structured orchestration metadata — not conversational text.
 */
export const ConversationIntents = {
  INFORM: "inform",
  REINFORCE: "reinforce",
  CAUTION: "caution",
  CELEBRATE: "celebrate",
  PREPARE: "prepare",
  FOCUS: "focus",
  CLARIFY: "clarify",
} as const;

export type ConversationIntent =
  (typeof ConversationIntents)[keyof typeof ConversationIntents];

export const ALL_CONVERSATION_INTENTS: readonly ConversationIntent[] =
  Object.freeze([
    ConversationIntents.INFORM,
    ConversationIntents.REINFORCE,
    ConversationIntents.CAUTION,
    ConversationIntents.CELEBRATE,
    ConversationIntents.PREPARE,
    ConversationIntents.FOCUS,
    ConversationIntents.CLARIFY,
  ]);
