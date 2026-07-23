import type { MemoryCategory } from "./MemoryCategory";
import type { MemoryPriority } from "./MemoryPriority";
import type { MemoryScope } from "./MemoryScope";

/**
 * Query modes for the deterministic memory query layer.
 */
export const MemoryQueryModes = {
  BY_CATEGORY: "by_category",
  BY_IDENTIFIER: "by_identifier",
  BY_PRIORITY: "by_priority",
  BY_TIME: "by_time",
  BY_SCOPE: "by_scope",
  LATEST: "latest",
  HISTORICAL: "historical",
} as const;

export type MemoryQueryMode =
  (typeof MemoryQueryModes)[keyof typeof MemoryQueryModes];

/**
 * Immutable memory query contract.
 */
export interface MemoryQuery {
  readonly id: string;
  readonly mode: MemoryQueryMode;
  readonly category: MemoryCategory | null;
  readonly identifierId: string | null;
  readonly key: string | null;
  readonly scope: MemoryScope | null;
  readonly minPriority: MemoryPriority | null;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly fromTime: string | null;
  readonly toTime: string | null;
  readonly limit: number | null;
  readonly latestOnly: boolean;
  readonly historical: boolean;
  readonly createdAt: string;
}
