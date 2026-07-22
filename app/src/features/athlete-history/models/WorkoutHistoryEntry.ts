import type { HistoryEntry } from "./HistoryEntry";
import { HistoryEntryTypes } from "./HistoryEntryType";

/**
 * Immutable history entry derived from a WorkoutResult.
 */
export interface WorkoutHistoryEntry extends HistoryEntry {
  readonly type: typeof HistoryEntryTypes.WORKOUT;
  readonly runtimeId: string;
  readonly sessionId: string;
  readonly finalState: string;
}
