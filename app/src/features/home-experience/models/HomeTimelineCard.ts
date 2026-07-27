/**
 * Immutable Home timeline card — composed from Coach Timeline.
 * Presentation only. Never invent journal entries.
 */
export interface HomeTimelineEventRef {
  readonly id: string;
  readonly category: string;
  readonly summary: string;
  readonly timestamp: string;
  readonly domain: string;
}

export interface HomeTimelineCard {
  readonly present: boolean;
  readonly recentDecisions: readonly HomeTimelineEventRef[];
  readonly latestModifications: readonly HomeTimelineEventRef[];
  readonly restoreEvents: readonly HomeTimelineEventRef[];
  readonly entryCount: number;
  readonly summary: string;
}
