import { CURRENT_CONVERSATION_PERSISTENCE_VERSION } from "../models/ConversationPersistenceVersion";
import type { Conversation } from "../models/Conversation";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStreamStatus } from "../models/ConversationStreamStatus";
import { deepCloneConversationSnapshot } from "./deepCloneConversation";

/** Project a working Conversation into a durable snapshot. */
export function toConversationSnapshot(
  conversation: Conversation,
  streamStatus: ConversationStreamStatus = "idle",
): ConversationSnapshot {
  return deepCloneConversationSnapshot(
    Object.freeze({
      id: conversation.id,
      status: conversation.status,
      messages: conversation.messages,
      metadata: conversation.metadata,
      session: conversation.session,
      streamStatus,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      schemaVersion: CURRENT_CONVERSATION_PERSISTENCE_VERSION,
    }),
  );
}

/** Rebuild a working Conversation from a durable snapshot. */
export function fromConversationSnapshot(
  snapshot: ConversationSnapshot,
): Conversation {
  return Object.freeze({
    id: snapshot.id,
    status: snapshot.status,
    messages: Object.freeze(
      snapshot.messages.map((message) => Object.freeze({ ...message })),
    ),
    metadata: Object.freeze({ ...snapshot.metadata }),
    session: Object.freeze({ ...snapshot.session }),
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
  });
}
