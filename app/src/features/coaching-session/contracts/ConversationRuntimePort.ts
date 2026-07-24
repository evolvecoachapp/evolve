/**
 * Port for Conversation Runtime consumption.
 * Session runtime accepts conversation linkage only — no chat business logic.
 */

export interface ConversationRuntimeDescriptor {
  readonly conversationId: string;
  readonly athleteId: string | null;
  readonly active: boolean;
}

export interface ConversationRuntimePort {
  describe(conversationId: string): ConversationRuntimeDescriptor | null;
}

export function createMockConversationRuntimePort(
  conversations: readonly ConversationRuntimeDescriptor[] = [],
): ConversationRuntimePort {
  const map = new Map(conversations.map((c) => [c.conversationId, c]));
  return {
    describe(conversationId) {
      return map.get(conversationId) ?? null;
    },
  };
}
