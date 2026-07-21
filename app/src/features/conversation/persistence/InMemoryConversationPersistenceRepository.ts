import { ConversationError } from "../models/ConversationError";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import { deepCloneConversationSnapshot } from "../utils/deepCloneConversation";
import {
  validateConversationSnapshot,
  type ConversationSnapshotValidationCode,
} from "../utils/validateConversationSnapshot";
import type { ConversationPersistenceRepository } from "./ConversationPersistenceRepository";
import { ConversationDeserializer } from "./ConversationDeserializer";
import { ConversationSerializer } from "./ConversationSerializer";
import { InMemoryStorageAdapter } from "./InMemoryStorageAdapter";
import type { StorageAdapter } from "./StorageAdapter";

const SNAPSHOT_KEY_PREFIX = "evolve.conversation.snapshot.";
const INDEX_KEY = "evolve.conversation.index";

/**
 * ConversationPersistenceRepository backed by an injected StorageAdapter.
 *
 * Defaults to InMemoryStorageAdapter — no AsyncStorage / MMKV / SQLite.
 */
export class InMemoryConversationPersistenceRepository
  implements ConversationPersistenceRepository
{
  private readonly serializer = new ConversationSerializer();
  private readonly deserializer = new ConversationDeserializer();

  constructor(
    private readonly storage: StorageAdapter = new InMemoryStorageAdapter(),
  ) {}

  async saveConversation(
    snapshot: ConversationSnapshot,
  ): Promise<ConversationSnapshot> {
    const issues = this.validateSnapshot(snapshot);
    if (issues.length > 0) {
      throw new ConversationError(
        "invalid_conversation",
        `Invalid snapshot: ${issues.join(",")}`,
        { conversationId: snapshot.id },
      );
    }

    const stored = deepCloneConversationSnapshot(snapshot);
    await this.storage.setItem(
      snapshotKey(stored.id),
      this.serializer.serialize(stored),
    );
    await this.addToIndex(stored.id);
    return deepCloneConversationSnapshot(stored);
  }

  async loadConversation(id: string): Promise<ConversationSnapshot | null> {
    const raw = await this.storage.getItem(snapshotKey(id));
    if (raw === null) {
      return null;
    }

    const snapshot = this.deserializer.deserialize(raw);
    return snapshot ? deepCloneConversationSnapshot(snapshot) : null;
  }

  async deleteConversation(id: string): Promise<void> {
    const existing = await this.storage.getItem(snapshotKey(id));
    if (existing === null) {
      throw new ConversationError(
        "not_found",
        `Persisted conversation not found: ${id}`,
        { conversationId: id },
      );
    }

    await this.storage.removeItem(snapshotKey(id));
    await this.removeFromIndex(id);
  }

  async listConversations(): Promise<readonly ConversationSnapshot[]> {
    const ids = await this.readIndex();
    const snapshots: ConversationSnapshot[] = [];

    for (const id of ids) {
      const snapshot = await this.loadConversation(id);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    snapshots.sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt),
    );

    return Object.freeze(snapshots.map(deepCloneConversationSnapshot));
  }

  validateSnapshot(
    snapshot: ConversationSnapshot,
  ): readonly ConversationSnapshotValidationCode[] {
    return validateConversationSnapshot(snapshot);
  }

  /** Test helper — wipe all persisted snapshots. */
  async clear(): Promise<void> {
    const ids = await this.readIndex();
    for (const id of ids) {
      await this.storage.removeItem(snapshotKey(id));
    }
    await this.storage.removeItem(INDEX_KEY);
  }

  private async readIndex(): Promise<string[]> {
    const raw = await this.storage.getItem(INDEX_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.filter((entry): entry is string => typeof entry === "string");
    } catch {
      return [];
    }
  }

  private async writeIndex(ids: readonly string[]): Promise<void> {
    await this.storage.setItem(INDEX_KEY, JSON.stringify([...ids]));
  }

  private async addToIndex(id: string): Promise<void> {
    const ids = await this.readIndex();
    if (!ids.includes(id)) {
      ids.push(id);
      await this.writeIndex(ids);
    }
  }

  private async removeFromIndex(id: string): Promise<void> {
    const ids = await this.readIndex();
    await this.writeIndex(ids.filter((entry) => entry !== id));
  }
}

function snapshotKey(id: string): string {
  return `${SNAPSHOT_KEY_PREFIX}${id}`;
}
