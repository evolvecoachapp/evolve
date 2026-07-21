import { ConversationError } from "../models/ConversationError";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationSummary } from "../models/ConversationSummary";
import type { MessageStatus } from "../models/MessageStatus";
import { sortMessages } from "../utils/sortMessages";
import type { ConversationRepository } from "./ConversationRepository";

function cloneConversation(conversation: Conversation): Conversation {
  return Object.freeze({
    ...conversation,
    messages: Object.freeze(conversation.messages.map((message) =>
      Object.freeze({ ...message }),
    )),
    metadata: Object.freeze({ ...conversation.metadata }),
    session: Object.freeze({ ...conversation.session }),
  });
}

function toSummary(conversation: Conversation): ConversationSummary {
  return Object.freeze({
    id: conversation.id,
    title: conversation.metadata.title,
    status: conversation.status,
    messageCount: conversation.metadata.messageCount,
    lastMessageAt: conversation.metadata.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

function rebuildMetadata(
  conversation: Conversation,
  messages: readonly ConversationMessage[],
  updatedAt: string,
): Conversation["metadata"] {
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return Object.freeze({
    title: conversation.metadata.title,
    messageCount: messages.length,
    lastMessageAt: lastMessage?.createdAt ?? null,
    createdAt: conversation.metadata.createdAt,
    updatedAt,
  });
}

/**
 * Ephemeral in-process ConversationRepository.
 *
 * Suitable for tests and offline orchestration — not durable storage.
 */
export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, Conversation>();

  async create(conversation: Conversation): Promise<Conversation> {
    if (this.conversations.has(conversation.id)) {
      throw new ConversationError(
        "invalid_conversation",
        `Conversation already exists: ${conversation.id}`,
        { conversationId: conversation.id },
      );
    }

    const stored = cloneConversation(conversation);
    this.conversations.set(stored.id, stored);
    return cloneConversation(stored);
  }

  async getById(id: string): Promise<Conversation | null> {
    const found = this.conversations.get(id);
    return found ? cloneConversation(found) : null;
  }

  async appendMessage(
    conversationId: string,
    message: ConversationMessage,
  ): Promise<Conversation> {
    const existing = this.conversations.get(conversationId);
    if (!existing) {
      throw new ConversationError(
        "not_found",
        `Conversation not found: ${conversationId}`,
        { conversationId },
      );
    }

    if (message.conversationId !== conversationId) {
      throw new ConversationError(
        "invalid_message",
        "Message conversationId mismatch.",
        { conversationId, messageId: message.id },
      );
    }

    if (existing.messages.some((entry) => entry.id === message.id)) {
      throw new ConversationError(
        "invalid_message",
        `Message already exists: ${message.id}`,
        { conversationId, messageId: message.id },
      );
    }

    const messages = Object.freeze(
      sortMessages([...existing.messages, Object.freeze({ ...message })]),
    );
    const updatedAt = message.updatedAt || message.createdAt;
    const next = cloneConversation({
      ...existing,
      messages,
      metadata: rebuildMetadata(existing, messages, updatedAt),
      updatedAt,
    });

    this.conversations.set(conversationId, next);
    return cloneConversation(next);
  }

  async updateMessageStatus(
    conversationId: string,
    messageId: string,
    status: MessageStatus,
    errorCode?: string,
  ): Promise<Conversation> {
    const existing = this.conversations.get(conversationId);
    if (!existing) {
      throw new ConversationError(
        "not_found",
        `Conversation not found: ${conversationId}`,
        { conversationId },
      );
    }

    const index = existing.messages.findIndex(
      (message) => message.id === messageId,
    );
    if (index < 0) {
      throw new ConversationError(
        "not_found",
        `Message not found: ${messageId}`,
        { conversationId, messageId },
      );
    }

    const updatedAt = new Date().toISOString();
    const current = existing.messages[index]!;
    const nextMessage: ConversationMessage =
      status === "failed"
        ? Object.freeze({
            id: current.id,
            conversationId: current.conversationId,
            role: current.role,
            content: current.content,
            status,
            createdAt: current.createdAt,
            updatedAt,
            errorCode: errorCode ?? current.errorCode,
          })
        : Object.freeze({
            id: current.id,
            conversationId: current.conversationId,
            role: current.role,
            content: current.content,
            status,
            createdAt: current.createdAt,
            updatedAt,
          });

    const messages = Object.freeze(
      existing.messages.map((message, messageIndex) =>
        messageIndex === index ? nextMessage : message,
      ),
    );

    const nextStatus =
      existing.status === "closed"
        ? "closed"
        : status === "failed"
          ? "error"
          : existing.status === "error"
            ? "active"
            : existing.status;

    const next = cloneConversation({
      ...existing,
      status: nextStatus,
      messages,
      metadata: rebuildMetadata(existing, messages, updatedAt),
      updatedAt,
    });

    this.conversations.set(conversationId, next);
    return cloneConversation(next);
  }

  async updateMessageContent(
    conversationId: string,
    messageId: string,
    content: string,
  ): Promise<Conversation> {
    const existing = this.conversations.get(conversationId);
    if (!existing) {
      throw new ConversationError(
        "not_found",
        `Conversation not found: ${conversationId}`,
        { conversationId },
      );
    }

    const index = existing.messages.findIndex(
      (message) => message.id === messageId,
    );
    if (index < 0) {
      throw new ConversationError(
        "not_found",
        `Message not found: ${messageId}`,
        { conversationId, messageId },
      );
    }

    const updatedAt = new Date().toISOString();
    const current = existing.messages[index]!;
    const nextMessage: ConversationMessage = Object.freeze({
      id: current.id,
      conversationId: current.conversationId,
      role: current.role,
      content,
      status: current.status,
      createdAt: current.createdAt,
      updatedAt,
      ...(current.errorCode ? { errorCode: current.errorCode } : {}),
    });

    const messages = Object.freeze(
      existing.messages.map((message, messageIndex) =>
        messageIndex === index ? nextMessage : message,
      ),
    );

    const next = cloneConversation({
      ...existing,
      messages,
      metadata: rebuildMetadata(existing, messages, updatedAt),
      updatedAt,
    });

    this.conversations.set(conversationId, next);
    return cloneConversation(next);
  }

  async updateTitle(
    conversationId: string,
    title: string,
  ): Promise<Conversation> {
    const existing = this.conversations.get(conversationId);
    if (!existing) {
      throw new ConversationError(
        "not_found",
        `Conversation not found: ${conversationId}`,
        { conversationId },
      );
    }

    const updatedAt = new Date().toISOString();
    const next = cloneConversation({
      ...existing,
      metadata: Object.freeze({
        ...existing.metadata,
        title,
        updatedAt,
      }),
      updatedAt,
    });

    this.conversations.set(conversationId, next);
    return cloneConversation(next);
  }

  async close(id: string): Promise<Conversation> {
    const existing = this.conversations.get(id);
    if (!existing) {
      throw new ConversationError("not_found", `Conversation not found: ${id}`, {
        conversationId: id,
      });
    }

    const updatedAt = new Date().toISOString();
    const next = cloneConversation({
      ...existing,
      status: "closed",
      session: Object.freeze({
        ...existing.session,
        endedAt: updatedAt,
      }),
      metadata: Object.freeze({
        ...existing.metadata,
        updatedAt,
      }),
      updatedAt,
    });

    this.conversations.set(id, next);
    return cloneConversation(next);
  }

  async delete(id: string): Promise<void> {
    if (!this.conversations.has(id)) {
      throw new ConversationError("not_found", `Conversation not found: ${id}`, {
        conversationId: id,
      });
    }
    this.conversations.delete(id);
  }

  async list(): Promise<readonly ConversationSummary[]> {
    const summaries = Array.from(this.conversations.values())
      .map(toSummary)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

    return Object.freeze(summaries);
  }

  /** Test helper — wipe all stored conversations. */
  async clear(): Promise<void> {
    this.conversations.clear();
  }
}
