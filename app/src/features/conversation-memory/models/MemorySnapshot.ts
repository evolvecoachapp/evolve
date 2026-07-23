import type { MemoryContext } from "./MemoryContext";
import type { MemoryDecision } from "./MemoryDecision";
import type { MemoryEntry } from "./MemoryEntry";
import type { MemoryMetadata } from "./MemoryMetadata";
import type { MemoryProfile } from "./MemoryProfile";

/**
 * Immutable point-in-time memory snapshot for Coach Agent consumption.
 */
export interface MemorySnapshot {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly entries: readonly MemoryEntry[];
  readonly profile: MemoryProfile;
  readonly context: MemoryContext;
  readonly decision: MemoryDecision;
  readonly entryCount: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
