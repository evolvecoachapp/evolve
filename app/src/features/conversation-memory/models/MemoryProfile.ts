import type { MemoryEntry } from "./MemoryEntry";
import type { MemoryMetadata } from "./MemoryMetadata";

/**
 * Immutable Profile Memory projection (preferences, goals, constraints, profile).
 */
export interface MemoryProfile {
  readonly id: string;
  readonly athleteId: string | null;
  readonly entries: readonly MemoryEntry[];
  readonly entryCount: number;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}
