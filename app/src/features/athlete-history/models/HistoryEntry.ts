import type { HistoryContext } from "./HistoryContext";
import type { HistoryEntryCategory } from "./HistoryEntryCategory";
import type { HistoryEntryId } from "./HistoryEntryId";
import type { HistoryEntryType } from "./HistoryEntryType";
import type { HistoryEvidence } from "./HistoryEvidence";
import type { HistoryMetadata } from "./HistoryMetadata";
import type { HistoryReference } from "./HistoryReference";

/**
 * Immutable chronological history entry.
 * Future entry kinds extend via type/category strings — core shape stays stable.
 */
export interface HistoryEntry {
  readonly id: HistoryEntryId;
  readonly type: HistoryEntryType;
  readonly category: HistoryEntryCategory;
  readonly occurredAt: string;
  readonly title: string;
  readonly description: string;
  readonly references: readonly HistoryReference[];
  readonly evidence: HistoryEvidence;
  readonly context: HistoryContext;
  readonly metadata: HistoryMetadata;
  readonly frozenAt: string;
}
