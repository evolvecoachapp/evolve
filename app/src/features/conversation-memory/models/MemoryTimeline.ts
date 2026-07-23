import type { MemoryEvent } from "./MemoryEvent";
import type { MemoryMetadata } from "./MemoryMetadata";

/**
 * Immutable ordered memory event timeline.
 */
export interface MemoryTimeline {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly events: readonly MemoryEvent[];
  readonly eventCount: number;
  readonly nextSequence: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly frozenAt: string;
}
