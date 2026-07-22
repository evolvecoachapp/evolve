import type { ConversationContext } from "../../../src/features/ai/models/ConversationContext";
import type { ChatMessage } from "../../../src/features/ai/models/ChatMessage";
import { INTEGRATION_FIXED_TIMESTAMP } from "../shared/constants";

/**
 * Fluent builder for immutable ConversationContext values.
 */
export class ConversationBuilder {
  private conversationId = "conversation-integration-1";
  private messages: ChatMessage[] = [];

  withId(conversationId: string): this {
    this.conversationId = conversationId;
    return this;
  }

  withUserMessage(content: string, id = `msg-user-${this.messages.length + 1}`): this {
    this.messages.push(
      Object.freeze({
        id,
        role: "user",
        content,
        createdAt: INTEGRATION_FIXED_TIMESTAMP,
      }),
    );
    return this;
  }

  withAssistantMessage(
    content: string,
    id = `msg-assistant-${this.messages.length + 1}`,
  ): this {
    this.messages.push(
      Object.freeze({
        id,
        role: "assistant",
        content,
        createdAt: INTEGRATION_FIXED_TIMESTAMP,
      }),
    );
    return this;
  }

  withMessages(messages: readonly ChatMessage[]): this {
    this.messages = messages.map((message) => Object.freeze({ ...message }));
    return this;
  }

  build(): ConversationContext {
    return Object.freeze({
      conversationId: this.conversationId,
      messages: Object.freeze([...this.messages]),
    });
  }
}

export function buildConversation(): ConversationBuilder {
  return new ConversationBuilder();
}
