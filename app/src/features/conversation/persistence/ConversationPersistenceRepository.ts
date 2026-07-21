import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationSnapshotValidationCode } from "../utils/validateConversationSnapshot";

/**
 * Durable conversation persistence boundary.
 *
 * Implementations use a StorageAdapter for string I/O. No cloud sync,
 * authentication, or concrete AsyncStorage / SQLite coupling.
 */
export interface ConversationPersistenceRepository {
  saveConversation(snapshot: ConversationSnapshot): Promise<ConversationSnapshot>;

  loadConversation(id: string): Promise<ConversationSnapshot | null>;

  deleteConversation(id: string): Promise<void>;

  listConversations(): Promise<readonly ConversationSnapshot[]>;

  validateSnapshot(
    snapshot: ConversationSnapshot,
  ): readonly ConversationSnapshotValidationCode[];
}
