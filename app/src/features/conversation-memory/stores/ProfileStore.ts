import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryProfile } from "../models/MemoryProfile";

/**
 * Future persistence contract for Profile Memory.
 *
 * No implementation in this sprint — contracts only.
 */
export interface ProfileStore {
  readonly id: string;
  save(entry: MemoryEntry): Promise<void> | void;
  loadProfile(athleteId: string | null): Promise<MemoryProfile | null> | MemoryProfile | null;
  list(athleteId: string | null): Promise<readonly MemoryEntry[]> | readonly MemoryEntry[];
}
