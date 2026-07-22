import type { AthleteProfile } from "../../athlete-context/models/AthleteProfile";
import { AIError } from "../../ai/models/AIError";
import type { AIStreamEvent } from "../../ai/models/AIStreamEvent";
import type { StreamingMetadata } from "../../ai/models/StreamingMetadata";
import type { StreamingSession } from "../../ai/models/StreamingSession";
import type { AIService } from "../../ai/services/AIService";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { MemoryContext } from "../../prompt-orchestrator/models/MemoryContext";
import type { PromptOrchestrator } from "../../prompt-orchestrator/services/PromptOrchestrator";
import type { PromptContext } from "../../prompt-builder/models/PromptContext";
import { receiveComposedPromptContext } from "../../prompt-builder/utils/receiveComposedPromptContext";
import type { WorkoutSummary } from "../../workout/models/WorkoutSummary";
import { ConversationError } from "../models/ConversationError";
import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStreamStatus } from "../models/ConversationStreamStatus";
import type { ConversationRepository } from "../repository/ConversationRepository";
import { buildConversationContext } from "../utils/buildConversationContext";
import { generateConversationTitle } from "../utils/generateConversationTitle";
import { validateConversation } from "../utils/validateConversation";
import { validateMessage } from "../utils/validateMessage";

export interface StartConversationOptions {
  readonly now?: string;
  readonly title?: string;
}

/** Optional domain sources for Prompt Orchestrator composition. */
export interface PromptOrchestrationSources {
  readonly athleteProfile?: AthleteProfile | null;
  readonly memory?: MemoryContext | null;
  readonly workoutSummary?: WorkoutSummary | null;
  readonly coachSummary?: CoachSummary | null;
}

export interface SendMessageOptions {
  readonly conversationId: string;
  readonly content: string;
  readonly promptContext: PromptContext;
  readonly orchestrationSources?: PromptOrchestrationSources;
  readonly now?: string;
  /** Incremental conversation snapshots while the assistant streams. */
  readonly onConversationUpdate?: (conversation: Conversation) => void;
}

export interface RetryMessageOptions {
  readonly conversationId: string;
  readonly messageId: string;
  readonly promptContext: PromptContext;
  readonly orchestrationSources?: PromptOrchestrationSources;
  readonly now?: string;
  readonly onConversationUpdate?: (conversation: Conversation) => void;
}

interface ActiveStreamState {
  readonly conversationId: string;
  readonly userMessageId: string;
  readonly assistantMessageId: string;
  readonly abortController: AbortController;
  session: StreamingSession;
}

/**
 * Orchestrates conversation state, AI generation, and persistence lifecycle.
 *
 * Owns streaming and durable restore/persist/clear. Depends on
 * ConversationRepository and AIService — never on a concrete StorageAdapter.
 * When PromptOrchestrator is injected, delegates prompt composition before
 * Prompt Builder acceptance and AIService generation.
 */
export class ConversationService {
  private activeStream: ActiveStreamState | null = null;

  constructor(
    private readonly repository: ConversationRepository,
    private readonly aiService: AIService,
    private readonly promptOrchestrator: PromptOrchestrator | null = null,
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
   * Append a user message, stream an assistant reply, and update history
   * incrementally.
   */
  async sendMessage(options: SendMessageOptions): Promise<Conversation> {
    const now = options.now ?? new Date().toISOString();
    this.assertNoActiveStream(options.conversationId);

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
    options.onConversationUpdate?.(current);

    if (current.messages.length === 1) {
      current = await this.repository.updateTitle(
        current.id,
        generateConversationTitle(options.content),
      );
      options.onConversationUpdate?.(current);
    }

    current = await this.repository.updateMessageStatus(
      current.id,
      userMessage.id,
      "sent",
    );
    options.onConversationUpdate?.(current);
    await this.autoPersist(current, "idle");

    return this.streamAssistantReply({
      conversation: current,
      promptContext: options.promptContext,
      userContent: options.content,
      orchestrationSources: options.orchestrationSources,
      failedMessageId: userMessage.id,
      now,
      onConversationUpdate: options.onConversationUpdate,
    });
  }

  /**
   * Retry AI generation for a failed user message.
   */
  async retryMessage(options: RetryMessageOptions): Promise<Conversation> {
    const now = options.now ?? new Date().toISOString();
    this.assertNoActiveStream(options.conversationId);

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
    options.onConversationUpdate?.(current);

    return this.streamAssistantReply({
      conversation: current,
      promptContext: options.promptContext,
      userContent: target.content,
      orchestrationSources: options.orchestrationSources,
      failedMessageId: target.id,
      now,
      onConversationUpdate: options.onConversationUpdate,
    });
  }

  /** Cancel the active stream, if any. Keeps partial assistant content. */
  async cancelStream(): Promise<Conversation | null> {
    const active = this.activeStream;
    if (!active) {
      return null;
    }

    active.abortController.abort();
    active.session = Object.freeze({
      ...active.session,
      status: "cancelled",
      metadata: Object.freeze({
        ...active.session.metadata,
        completedAt: new Date().toISOString(),
      }),
    });

    try {
      const conversation = await this.repository.getById(active.conversationId);
      return conversation;
    } finally {
      // Active stream cleared when streamAssistantReply settles.
    }
  }

  /** Current streaming session snapshot, or null when idle. */
  getCurrentStream(): StreamingSession | null {
    return this.activeStream?.session ?? null;
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

  /**
   * Restore a conversation from durable storage into the working store.
   * When conversationId is omitted, restores the most recently updated snapshot.
   */
  async restoreConversation(
    conversationId?: string,
  ): Promise<Conversation | null> {
    return this.repository.restoreFromPersistence(conversationId);
  }

  /** Persist the current working conversation as a durable snapshot. */
  async persistConversation(
    conversationId: string,
  ): Promise<ConversationSnapshot> {
    const conversation = await this.requireConversation(conversationId);
    const streamStatus = this.resolveStreamStatus();
    return this.repository.persistSnapshot(conversation, streamStatus);
  }

  /**
   * Clear conversation history from working store and durable persistence.
   * When conversationId is omitted, clears all conversations.
   */
  async clearConversation(conversationId?: string): Promise<void> {
    if (this.activeStream) {
      if (
        conversationId === undefined ||
        this.activeStream.conversationId === conversationId
      ) {
        this.activeStream.abortController.abort();
        this.activeStream = null;
      }
    }

    await this.repository.clearPersisted(conversationId);
  }

  private resolveStreamStatus(): ConversationStreamStatus {
    const status = this.activeStream?.session.status;
    if (
      status === "starting" ||
      status === "streaming" ||
      status === "completed" ||
      status === "cancelled" ||
      status === "failed"
    ) {
      return status;
    }
    return "idle";
  }

  private async autoPersist(
    conversation: Conversation,
    streamStatus: ConversationStreamStatus,
  ): Promise<void> {
    try {
      await this.repository.persistSnapshot(conversation, streamStatus);
    } catch {
      // Automatic persistence must not break the conversation lifecycle.
    }
  }

  private async streamAssistantReply(input: {
    readonly conversation: Conversation;
    readonly promptContext: PromptContext;
    readonly userContent: string;
    readonly orchestrationSources?: PromptOrchestrationSources;
    readonly failedMessageId: string;
    readonly now: string;
    readonly onConversationUpdate?: (conversation: Conversation) => void;
  }): Promise<Conversation> {
    const composed = await this.composePromptForReply({
      conversation: input.conversation,
      promptContext: input.promptContext,
      userContent: input.userContent,
      orchestrationSources: input.orchestrationSources,
    });
    const context = composed.conversationContext;
    const promptContext = composed.promptContext;
    const reusableAssistant = findReusableAssistantMessage(
      input.conversation,
      input.failedMessageId,
    );
    const assistantMessageId = reusableAssistant?.id ?? createId("msg");
    const sessionId = createId("stream");
    const startedAt = input.now;
    const abortController = new AbortController();

    const initialMetadata: StreamingMetadata = Object.freeze({
      provider: "local",
      model: Object.freeze({
        id: "unknown",
        name: "unknown",
        provider: "local" as const,
      }),
      startedAt,
      completedAt: null,
      chunkCount: 0,
    });

    let session: StreamingSession = Object.freeze({
      id: sessionId,
      conversationId: input.conversation.id,
      messageId: assistantMessageId,
      status: "starting",
      content: "",
      metadata: initialMetadata,
    });

    this.activeStream = {
      conversationId: input.conversation.id,
      userMessageId: input.failedMessageId,
      assistantMessageId,
      abortController,
      session,
    };

    // Keep assistant after the user turn when timestamps would otherwise tie.
    const assistantAt = new Date(Date.parse(input.now) + 1).toISOString();

    let current = input.conversation;
    if (reusableAssistant) {
      current = await this.repository.updateMessageContent(
        input.conversation.id,
        assistantMessageId,
        "",
      );
      current = await this.repository.updateMessageStatus(
        input.conversation.id,
        assistantMessageId,
        "pending",
      );
    } else {
      current = await this.repository.appendMessage(
        input.conversation.id,
        createMessage({
          conversationId: input.conversation.id,
          role: "assistant",
          content: "",
          status: "pending",
          now: assistantAt,
          id: assistantMessageId,
        }),
      );
    }
    input.onConversationUpdate?.(current);

    const configuration = this.aiService.getConfiguration();
    session = Object.freeze({
      ...session,
      status: "streaming",
      metadata: Object.freeze({
        provider: configuration.provider.type,
        model: Object.freeze({
          id: configuration.model.id,
          name: configuration.model.id,
          provider: configuration.provider.type,
        }),
        startedAt,
        completedAt: null,
        chunkCount: 0,
      }),
    });
    this.activeStream.session = session;

    let aggregatedContent = "";

    try {
      const response = await this.aiService.streamResponse(
        promptContext,
        context,
        {
          signal: abortController.signal,
          onEvent: async (event: AIStreamEvent) => {
            if (!this.activeStream) {
              return;
            }

            if (event.type === "chunk") {
              aggregatedContent += event.chunk.delta;
              current = await this.repository.updateMessageContent(
                input.conversation.id,
                assistantMessageId,
                aggregatedContent,
              );
              session = Object.freeze({
                ...session,
                status: "streaming",
                content: aggregatedContent,
                metadata: Object.freeze({
                  ...session.metadata,
                  chunkCount: session.metadata.chunkCount + 1,
                }),
              });
              this.activeStream.session = session;
              input.onConversationUpdate?.(current);
              return;
            }

            if (event.type === "status") {
              session = Object.freeze({
                ...session,
                status: event.status,
                content: aggregatedContent,
              });
              this.activeStream.session = session;
            }
          },
        },
      );

      aggregatedContent = response.message.content || aggregatedContent;
      current = await this.repository.updateMessageContent(
        input.conversation.id,
        assistantMessageId,
        aggregatedContent,
      );
      current = await this.repository.updateMessageStatus(
        input.conversation.id,
        assistantMessageId,
        "sent",
      );

      session = Object.freeze({
        ...session,
        status: "completed",
        content: aggregatedContent,
        metadata: Object.freeze({
          ...session.metadata,
          provider: response.provider,
          model: response.model,
          completedAt: response.generatedAt,
        }),
      });
      if (this.activeStream) {
        this.activeStream.session = session;
      }

      input.onConversationUpdate?.(current);
      await this.autoPersist(current, "completed");
      return current;
    } catch (error: unknown) {
      if (
        error instanceof AIError &&
        error.code === "stream_cancelled"
      ) {
        current = await this.finishCancelledStream({
          conversationId: input.conversation.id,
          assistantMessageId,
          content: aggregatedContent,
          now: input.now,
        });
        input.onConversationUpdate?.(current);

        throw new ConversationError(
          "stream_cancelled",
          "Assistant stream was cancelled.",
          {
            conversationId: input.conversation.id,
            messageId: assistantMessageId,
          },
        );
      }

      await this.repository.updateMessageStatus(
        input.conversation.id,
        input.failedMessageId,
        "failed",
        error instanceof AIError ? error.code : "generation_failed",
      );

      await this.repository.updateMessageStatus(
        input.conversation.id,
        assistantMessageId,
        "failed",
        error instanceof AIError ? error.code : "generation_failed",
      );

      if (this.activeStream) {
        this.activeStream.session = Object.freeze({
          ...session,
          status: "failed",
          content: aggregatedContent,
          metadata: Object.freeze({
            ...session.metadata,
            completedAt: new Date().toISOString(),
          }),
        });
      }

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
    } finally {
      this.activeStream = null;
    }
  }

  private async finishCancelledStream(input: {
    readonly conversationId: string;
    readonly assistantMessageId: string;
    readonly content: string;
    readonly now: string;
  }): Promise<Conversation> {
    let current = await this.repository.updateMessageContent(
      input.conversationId,
      input.assistantMessageId,
      input.content,
    );

    if (input.content.trim().length > 0) {
      current = await this.repository.updateMessageStatus(
        input.conversationId,
        input.assistantMessageId,
        "sent",
      );
    } else {
      current = await this.repository.updateMessageStatus(
        input.conversationId,
        input.assistantMessageId,
        "failed",
        "stream_cancelled",
      );
    }

    return current;
  }

  private assertNoActiveStream(conversationId: string): void {
    if (this.activeStream) {
      throw new ConversationError(
        "stream_in_progress",
        "A stream is already in progress.",
        { conversationId },
      );
    }
  }

  private async composePromptForReply(input: {
    readonly conversation: Conversation;
    readonly promptContext: PromptContext;
    readonly userContent: string;
    readonly orchestrationSources?: PromptOrchestrationSources;
  }): Promise<{
    readonly promptContext: PromptContext;
    readonly conversationContext: ReturnType<typeof buildConversationContext> | undefined;
  }> {
    const conversationContext = buildConversationContext(input.conversation);

    if (!this.promptOrchestrator) {
      return {
        promptContext: receiveComposedPromptContext(input.promptContext),
        conversationContext,
      };
    }

    const result = await this.promptOrchestrator.orchestrate({
      message: input.userContent,
      conversation: conversationContext,
      athleteProfile: input.orchestrationSources?.athleteProfile,
      memory: input.orchestrationSources?.memory,
      workoutSummary: input.orchestrationSources?.workoutSummary,
      coachSummary: input.orchestrationSources?.coachSummary,
      promptContext: input.promptContext,
    });

    const composedPrompt =
      result.composition.promptContext ?? input.promptContext;

    return {
      promptContext: receiveComposedPromptContext(composedPrompt),
      conversationContext: result.composition.conversation ?? undefined,
    };
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

function findReusableAssistantMessage(
  conversation: Conversation,
  userMessageId: string,
): ConversationMessage | null {
  const userIndex = conversation.messages.findIndex(
    (message) => message.id === userMessageId,
  );
  if (userIndex < 0) {
    return null;
  }

  const following = conversation.messages.slice(userIndex + 1);
  const failedAssistant = following.find(
    (message) => message.role === "assistant" && message.status === "failed",
  );
  return failedAssistant ?? null;
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
