import type { MemoryCategory } from "./MemoryCategory";

/**
 * Compact immutable summary of a memory operation or working set.
 */
export interface MemorySummary {
  readonly id: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly entryCount: number;
  readonly profileCount: number;
  readonly contextCount: number;
  readonly decisionCount: number;
  readonly categories: readonly MemoryCategory[];
  readonly message: string;
  readonly createdAt: string;
}
