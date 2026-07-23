import type { MemoryDecision } from "../models/MemoryDecision";
import type { MemoryEntry } from "../models/MemoryEntry";

/**
 * Future persistence contract for Decision Memory.
 *
 * No implementation in this sprint — contracts only.
 */
export interface DecisionStore {
  readonly id: string;
  save(entry: MemoryEntry): Promise<void> | void;
  loadDecisions(
    conversationId: string | null,
  ): Promise<MemoryDecision | null> | MemoryDecision | null;
  list(
    conversationId: string | null,
  ): Promise<readonly MemoryEntry[]> | readonly MemoryEntry[];
}
