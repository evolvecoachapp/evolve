import type { MemoryCategory } from "./MemoryCategory";
import type { MemoryIdentifier } from "./MemoryIdentifier";
import type { MemoryMetadata } from "./MemoryMetadata";
import type { MemoryPriority } from "./MemoryPriority";
import type { MemoryScope } from "./MemoryScope";

/**
 * Immutable structured coaching knowledge entry.
 *
 * Not a chat message — a deterministic memory fact for the Coach Agent.
 */
export interface MemoryEntry {
  readonly id: string;
  readonly identifier: MemoryIdentifier;
  readonly category: MemoryCategory;
  readonly scope: MemoryScope;
  readonly priority: MemoryPriority;
  readonly key: string;
  readonly value: string;
  readonly summary: string | null;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly version: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}
