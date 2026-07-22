import type { HistoryEntry } from "./HistoryEntry";
import { HistoryEntryTypes } from "./HistoryEntryType";

/**
 * Immutable history entry derived from a PerformanceSnapshot.
 */
export interface PerformanceHistoryEntry extends HistoryEntry {
  readonly type: typeof HistoryEntryTypes.PERFORMANCE;
  readonly performanceSnapshotId: string;
  readonly grade: string;
  readonly tonnage: number;
}
