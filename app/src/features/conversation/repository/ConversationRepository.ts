import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStreamStatus } from "../models/ConversationStreamStatus";
import type { ConversationSummary } from "../models/ConversationSummary";
import type { MessageStatus } from "../models/MessageStatus";

/**
 * Working-store boundary for Conversation aggregates.
 *
 * Implementations must not call AI providers, networking, or UI.
 * Durable persistence is delegated to ConversationPersistenceRepository
 * via persistSnapshot / restoreFromPersistence / clearPersisted.
 * AsyncStorage / cloud sync are out of scope for this interface's consumers.
 */
export interface ConversationRepository {
  /** Persist a newly created conversation. */
  create(conversation: Conversation): Promise<Conversation>;

  /** Load a conversation by id, or null when missing. */
  getById(id: string): Promise<Conversation | null>;

  /** Append a message and refresh metadata timestamps. */
  appendMessage(
    conversationId: string,
    message: ConversationMessage,
  ): Promise<Conversation>;

  /** Update a message delivery status in place. */
  updateMessageStatus(
    conversationId: string,
    messageId: string,
    status: MessageStatus,
    errorCode?: string,
  ): Promise<Conversation>;

  /** Replace message content in place (streaming partial updates). */
  updateMessageContent(
    conversationId: string,
    messageId: string,
    content: string,
  ): Promise<Conversation>;

  /** Update the conversation display title. */
  updateTitle(conversationId: string, title: string): Promise<Conversation>;

  /** Mark a conversation closed and end its session. */
  close(id: string): Promise<Conversation>;

  /** Permanently remove a conversation (working store + durable). */
  delete(id: string): Promise<void>;

  /** List conversation summaries, newest updated first. */
  list(): Promise<readonly ConversationSummary[]>;

  /** Write a durable snapshot through ConversationPersistenceRepository. */
  persistSnapshot(
    conversation: Conversation,
    streamStatus?: ConversationStreamStatus,
  ): Promise<ConversationSnapshot>;

  /**
   * Load a durable snapshot into the working store.
   * When conversationId is omitted, restores the most recently updated snapshot.
   */
  restoreFromPersistence(
    conversationId?: string,
  ): Promise<Conversation | null>;

  /**
   * Clear durable persistence (and matching working entries).
   * When conversationId is omitted, clears all conversations.
   */
  clearPersisted(conversationId?: string): Promise<void>;
}
