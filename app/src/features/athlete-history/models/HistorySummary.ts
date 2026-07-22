/**
 * Compact public summary of an athlete history build.
 */
export interface HistorySummary {
  readonly historyId: string;
  readonly athleteId: string | null;
  readonly entryCount: number;
  readonly workoutCount: number;
  readonly performanceCount: number;
  readonly achievementCount: number;
  readonly categories: readonly string[];
  readonly types: readonly string[];
  readonly firstOccurredAt: string | null;
  readonly lastOccurredAt: string | null;
  readonly summaryText: string;
}
