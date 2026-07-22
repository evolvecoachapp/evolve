/**
 * Intended audience for a conversation context.
 * Metadata only — does not generate messages.
 */
export const ConversationAudiences = {
  ATHLETE: "athlete",
  SYSTEM: "system",
  REVIEW: "review",
} as const;

export type ConversationAudience =
  (typeof ConversationAudiences)[keyof typeof ConversationAudiences];

export const ALL_CONVERSATION_AUDIENCES: readonly ConversationAudience[] =
  Object.freeze([
    ConversationAudiences.ATHLETE,
    ConversationAudiences.SYSTEM,
    ConversationAudiences.REVIEW,
  ]);
