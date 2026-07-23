import type { MemoryEntry } from "./MemoryEntry";
import type { MemoryMetadata } from "./MemoryMetadata";

/**
 * Immutable Context Memory projection (session/conversation context + summaries).
 */
export interface MemoryContext {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly entries: readonly MemoryEntry[];
  readonly entryCount: number;
  readonly turnCount: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
