import type { MemoryMetadata } from "./MemoryMetadata";
import type { MemoryPriority } from "./MemoryPriority";

/**
 * Immutable partial update for an existing memory entry.
 */
export interface MemoryUpdate {
  readonly id: string;
  readonly entryId: string;
  readonly value: string | null;
  readonly summary: string | null;
  readonly priority: MemoryPriority | null;
  readonly metadata: MemoryMetadata | null;
  readonly reason: string | null;
  readonly createdAt: string;
}
