import type { MemoryCategory } from "./MemoryCategory";
import type { MemoryMetadata } from "./MemoryMetadata";

/**
 * Ordered memory lifecycle events for the timeline.
 */
export const MemoryEventTypes = {
  SAVED: "saved",
  LOADED: "loaded",
  QUERIED: "queried",
  UPDATED: "updated",
  MERGED: "merged",
  CONFLICTED: "conflicted",
  RETAINED: "retained",
  EVICTED: "evicted",
  SNAPSHOT_BUILT: "snapshot_built",
  SUMMARIZED: "summarized",
} as const;

export type MemoryEventType =
  (typeof MemoryEventTypes)[keyof typeof MemoryEventTypes];

export interface MemoryEvent {
  readonly id: string;
  readonly type: MemoryEventType;
  readonly entryId: string | null;
  readonly category: MemoryCategory | null;
  readonly message: string;
  readonly sequence: number;
  readonly metadata: MemoryMetadata;
  readonly occurredAt: string;
}
