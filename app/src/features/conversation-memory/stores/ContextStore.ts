import type { MemoryContext } from "../models/MemoryContext";
import type { MemoryEntry } from "../models/MemoryEntry";

/**
 * Future persistence contract for Context Memory.
 *
 * No implementation in this sprint — contracts only.
 */
export interface ContextStore {
  readonly id: string;
  save(entry: MemoryEntry): Promise<void> | void;
  loadContext(
    conversationId: string | null,
  ): Promise<MemoryContext | null> | MemoryContext | null;
  list(
    conversationId: string | null,
  ): Promise<readonly MemoryEntry[]> | readonly MemoryEntry[];
}
