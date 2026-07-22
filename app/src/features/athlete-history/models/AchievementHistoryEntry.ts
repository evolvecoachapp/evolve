import type { HistoryEntry } from "./HistoryEntry";
import { HistoryEntryTypes } from "./HistoryEntryType";

/**
 * Immutable history entry derived from an unlocked Achievement.
 */
export interface AchievementHistoryEntry extends HistoryEntry {
  readonly type: typeof HistoryEntryTypes.ACHIEVEMENT;
  readonly achievementId: string;
  readonly achievementType: string;
  readonly achievementCategory: string;
}
