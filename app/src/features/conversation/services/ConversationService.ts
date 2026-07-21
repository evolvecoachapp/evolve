import { AIError } from "../../ai/models/AIError";
import type { AIResponse } from "../../ai/models/AIResponse";
import type { AIService } from "../../ai/services/AIService";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import { ConversationError } from "../models/ConversationError";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationRepository } from "../repository/ConversationRepository";
import { buildConversationContext } from "../utils/buildConversationContext";
import { generateConversationTitle } from "../utils/generateConversationTitle";
import { validateConversation } from "../utils/validateConversation";
import { validateMessage } from "../utils/validateMessage";

export interface StartConversationOptions {
  readonly now?: string;
  readonly title?: string;
}

export interface SendMessageOptions {
  readonly conversationId: string;
  readonly content: string;
  readonly promptContext: PromptContext;
  readonly now?: string;
}

export interface RetryMessageOptions {
  readonly conversationId: string;
  readonly messageId: string;
  readonly promptContext: PromptContext;
  readonly now?: string;
}

/**
 * Orchestrates conversation state and AI generation.
 *
 * Depends only on ConversationRepository and AIService — no networking,
 * no provider SDKs, no UI, no persistence adapters beyond the repository.
 */
export class ConversationService {
  constructor(
    private readonly repository: ConversationRepository,
    private readonly aiService: AIService,
  ) {}

  /** Create an empty active conversation with a fresh session. */
  async startConversation(
    options: StartConversationOptions = {},
  ): Promise<Conversation> {
    const now = options.now ?? new Date().toISOString();
    const conversationId = createId("conv");
    const sessionId = createId("sess");

    const conversation: Conversation = Object.freeze({
      id: conversationId,
      status: "active",
      messages: Object.freeze([]),
      metadata: Object.freeze({
        title: options.title ?? generateConversationTitle(null),
        messageCount: 0,
        lastMessageAt: null,
        createdAt: now,
        updatedAt: now,
      }),
      session: Object.freeze({
        id: sessionId,
        conversationId,
        startedAt: now,
        endedAt: null,
      }),
      createdAt: now,
      updatedAt: now,
    });

    const issues = validateConversation(conversation);
    if (issues.length > 0) {
      throw new ConversationError(
        "invalid_conversation",
        `Invalid conversation: ${issues.join(",")}`,
        { conversationId },
      );
    }

    return this.repository.create(conversation);
  }

  /**
   * Append a user message, call AIService, and append the assistant reply.
   */
  async sendMessage(options: SendMessageOptions): Promise<Conversation> {
    const now = options.now ?? new Date().toISOString();
    const conversation = await this.requireActiveConversation(
      options.conversationId,
    );

    const userMessage = createMessage({
      conversationId: conversation.id,
      role: "user",
      content: options.content,
      status: "pending",
      now,
    });

    assertValidMessage(userMessage);

    let current = await this.repository.appendMessage(
      conversation.id,
      userMessage,
    );

    if (current.messages.length === 1) {
      current = await this.repository.updateTitle(
        current.id,
        generateConversationTitle(options.content),
      );
    }

    current = await this.repository.updateMessageStatus(
      current.id,
      userMessage.id,
      "sent",
    );

    return this.generateAssistantReply({
      conversation: current,
      promptContext: options.promptContext,
      failedMessageId: userMessage.id,
      now,
    });
  }

  /**
   * Retry AI generation for a failed user message.
   */
  async retryMessage(options: RetryMessageOptions): Promise<Conversation> {
    const now = options.now ?? new Date().toISOString();
    const conversation = await this.requireActiveOrErrorConversation(
      options.conversationId,
    );

    const target = conversation.messages.find(
      (message) => message.id === options.messageId,
    );

    if (!target) {
      throw new ConversationError(
        "not_found",
        `Message not found: ${options.messageId}`,
        {
          conversationId: options.conversationId,
          messageId: options.messageId,
        },
      );
    }

    if (target.role !== "user" || target.status !== "failed") {
      throw new ConversationError(
        "message_not_retryable",
        "Only failed user messages can be retried.",
        {
          conversationId: options.conversationId,
          messageId: options.messageId,
        },
      );
    }

    const current = await this.repository.updateMessageStatus(
      conversation.id,
      target.id,
      "sent",
    );

    return this.generateAssistantReply({
      conversation: current,
      promptContext: options.promptContext,
      failedMessageId: target.id,
      now,
    });
  }

  async closeConversation(conversationId: string): Promise<Conversation> {
    await this.requireConversation(conversationId);
    return this.repository.close(conversationId);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.requireConversation(conversationId);
    await this.repository.delete(conversationId);
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.requireConversation(conversationId);
  }

  async listConversations() {
    return this.repository.list();
  }

  private async generateAssistantReply(input: {
    readonly conversation: Conversation;
    readonly promptContext: PromptContext;
    readonly failedMessageId: string;
    readonly now: string;
  }): Promise<Conversation> {
    const context = buildConversationContext(input.conversation);

    let response: AIResponse;
    try {
      response = await this.aiService.generateResponse(
        input.promptContext,
        context,
      );
    } catch (error: unknown) {
      await this.repository.updateMessageStatus(
        input.conversation.id,
        input.failedMessageId,
        "failed",
        error instanceof AIError ? error.code : "generation_failed",
      );

      if (error instanceof AIError) {
        throw new ConversationError(
          "provider_failed",
          error.message,
          {
            conversationId: input.conversation.id,
            messageId: input.failedMessageId,
          },
        );
      }

      throw new ConversationError(
        "generation_failed",
        error instanceof Error ? error.message : "AI generation failed.",
        {
          conversationId: input.conversation.id,
          messageId: input.failedMessageId,
        },
      );
    }

    const assistantMessage = createMessage({
      conversationId: input.conversation.id,
      role: "assistant",
      content: response.message.content,
      status: "sent",
      now: response.message.createdAt || input.now,
      id: response.message.id || createId("msg"),
    });

    assertValidMessage(assistantMessage);

    return this.repository.appendMessage(
      input.conversation.id,
      assistantMessage,
    );
  }

  private async requireConversation(
    conversationId: string,
  ): Promise<Conversation> {
    const conversation = await this.repository.getById(conversationId);
    if (!conversation) {
      throw new ConversationError(
        "not_found",
        `Conversation not found: ${conversationId}`,
        { conversationId },
      );
    }
    return conversation;
  }

  private async requireActiveConversation(
    conversationId: string,
  ): Promise<Conversation> {
    const conversation = await this.requireConversation(conversationId);
    if (conversation.status === "closed") {
      throw new ConversationError(
        "conversation_closed",
        "Cannot send messages to a closed conversation.",
        { conversationId },
      );
    }
    return conversation;
  }

  private async requireActiveOrErrorConversation(
    conversationId: string,
  ): Promise<Conversation> {
    const conversation = await this.requireConversation(conversationId);
    if (conversation.status === "closed") {
      throw new ConversationError(
        "conversation_closed",
        "Cannot retry messages on a closed conversation.",
        { conversationId },
      );
    }
    return conversation;
  }
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createMessage(input: {
  readonly conversationId: string;
  readonly role: ConversationMessage["role"];
  readonly content: string;
  readonly status: ConversationMessage["status"];
  readonly now: string;
  readonly id?: string;
}): ConversationMessage {
  return Object.freeze({
    id: input.id ?? createId("msg"),
    conversationId: input.conversationId,
    role: input.role,
    content: input.content.trim(),
    status: input.status,
    createdAt: input.now,
    updatedAt: input.now,
  });
}

function assertValidMessage(message: ConversationMessage): void {
  const issues = validateMessage(message);
  if (issues.length > 0) {
    throw new ConversationError(
      "invalid_message",
      `Invalid message: ${issues.join(",")}`,
      {
        conversationId: message.conversationId,
        messageId: message.id,
      },
    );
  }
}
