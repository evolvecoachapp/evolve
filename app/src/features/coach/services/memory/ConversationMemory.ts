import type { CoachMessage } from "../../types/coachMessage";

/** Abstraction for persisting conversation history across turns. */
export interface ConversationMemory {
  initConversation(conversationId: string, messages: CoachMessage[]): void;
  getHistory(conversationId: string): CoachMessage[];
  appendMessage(conversationId: string, message: CoachMessage): void;
  clearConversation(conversationId: string): void;
}
