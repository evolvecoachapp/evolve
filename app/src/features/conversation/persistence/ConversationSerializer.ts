import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import { ConversationError } from "../models/ConversationError";
import { validateConversationSnapshot } from "../utils/validateConversationSnapshot";

/**
 * Serialize a ConversationSnapshot to a JSON string.
 *
 * Rejects invalid snapshots before writing.
 */
export class ConversationSerializer {
  serialize(snapshot: ConversationSnapshot): string {
    const issues = validateConversationSnapshot(snapshot);
    if (issues.length > 0) {
      throw new ConversationError(
        "invalid_conversation",
        `Cannot serialize invalid snapshot: ${issues.join(",")}`,
        { conversationId: snapshot.id },
      );
    }

    return JSON.stringify({
      id: snapshot.id,
      status: snapshot.status,
      messages: snapshot.messages,
      metadata: snapshot.metadata,
      session: snapshot.session,
      streamStatus: snapshot.streamStatus,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      schemaVersion: snapshot.schemaVersion,
    });
  }
}
