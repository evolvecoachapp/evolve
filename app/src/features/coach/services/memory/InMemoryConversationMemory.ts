import type { CoachMessage } from "../../types/coachMessage";
import type { ConversationMemory } from "./ConversationMemory";

/** Ephemeral in-process memory — replace with persistent storage when wiring the backend. */
export class InMemoryConversationMemory implements ConversationMemory {
  private readonly store = new Map<string, CoachMessage[]>();

  initConversation(conversationId: string, messages: CoachMessage[]): void {
    this.store.set(conversationId, [...messages]);
  }

  getHistory(conversationId: string): CoachMessage[] {
    return [...(this.store.get(conversationId) ?? [])];
  }

  appendMessage(conversationId: string, message: CoachMessage): void {
    const history = this.store.get(conversationId) ?? [];
    this.store.set(conversationId, [...history, message]);
  }

  clearConversation(conversationId: string): void {
    this.store.delete(conversationId);
  }
}
