import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryQuery } from "../models/MemoryQuery";

/**
 * Future persistence contract for Conversation Memory.
 *
 * No implementation in this sprint — orchestration only.
 */
export interface MemoryStore {
  readonly id: string;
  save(entry: MemoryEntry): Promise<void> | void;
  load(entryId: string): Promise<MemoryEntry | null> | MemoryEntry | null;
  query(query: MemoryQuery): Promise<readonly MemoryEntry[]> | readonly MemoryEntry[];
  update(entry: MemoryEntry): Promise<void> | void;
  list(): Promise<readonly MemoryEntry[]> | readonly MemoryEntry[];
}
