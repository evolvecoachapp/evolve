import type { MemoryEntry } from "./MemoryEntry";
import type { MemoryEvent } from "./MemoryEvent";
import type { MemoryMetadata } from "./MemoryMetadata";
import type { MemorySnapshot } from "./MemorySnapshot";
import type { MemorySummary } from "./MemorySummary";
import type { MemoryTimeline } from "./MemoryTimeline";
import type { MemoryValidation } from "./MemoryValidation";

/**
 * Operation kinds returned by Conversation Memory.
 */
export const MemoryOperationKinds = {
  SAVE: "save",
  LOAD: "load",
  QUERY: "query",
  UPDATE: "update",
  SNAPSHOT: "snapshot",
  SUMMARIZE: "summarize",
} as const;

export type MemoryOperationKind =
  (typeof MemoryOperationKinds)[keyof typeof MemoryOperationKinds];

/**
 * Immutable primary output of Conversation Memory orchestration.
 */
export interface MemoryResult {
  readonly id: string;
  readonly operation: MemoryOperationKind;
  readonly success: boolean;
  readonly message: string | null;
  readonly entries: readonly MemoryEntry[];
  readonly snapshot: MemorySnapshot | null;
  readonly summary: MemorySummary | null;
  readonly timeline: MemoryTimeline | null;
  readonly validation: MemoryValidation;
  readonly events: readonly MemoryEvent[];
  readonly metadata: MemoryMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}
