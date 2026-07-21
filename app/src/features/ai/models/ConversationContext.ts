import type { ChatMessage } from "./ChatMessage";

/** Prior turns and identifiers for a conversation. */
export interface ConversationContext {
  readonly conversationId: string;
  readonly messages: readonly ChatMessage[];
}
