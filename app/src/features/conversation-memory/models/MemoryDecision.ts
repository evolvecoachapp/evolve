import type { MemoryEntry } from "./MemoryEntry";
import type { MemoryMetadata } from "./MemoryMetadata";

/**
 * Immutable Decision Memory projection (prior coaching decisions).
 */
export interface MemoryDecision {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly entries: readonly MemoryEntry[];
  readonly entryCount: number;
  readonly acceptedCount: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
