import type { Conversation } from "../models/Conversation";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";

function cloneMessage(message: ConversationMessage): ConversationMessage {
  return Object.freeze({
    ...message,
  });
}

/**
 * Deep-clone a Conversation aggregate into a frozen tree.
 */
export function deepCloneConversation(
  conversation: Conversation,
): Conversation {
  return Object.freeze({
    id: conversation.id,
    status: conversation.status,
    messages: Object.freeze(conversation.messages.map(cloneMessage)),
    metadata: Object.freeze({ ...conversation.metadata }),
    session: Object.freeze({ ...conversation.session }),
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  });
}

/**
 * Deep-clone a ConversationSnapshot into a frozen tree.
 */
export function deepCloneConversationSnapshot(
  snapshot: ConversationSnapshot,
): ConversationSnapshot {
  return Object.freeze({
    id: snapshot.id,
    status: snapshot.status,
    messages: Object.freeze(snapshot.messages.map(cloneMessage)),
    metadata: Object.freeze({ ...snapshot.metadata }),
    session: Object.freeze({ ...snapshot.session }),
    streamStatus: snapshot.streamStatus,
    createdAt: snapshot.createdAt,
    updatedAt: snapshot.updatedAt,
    schemaVersion: snapshot.schemaVersion,
  });
}
