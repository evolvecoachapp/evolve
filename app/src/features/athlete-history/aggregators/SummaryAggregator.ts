import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySummary } from "../models/HistorySummary";
import { HistorySummaryBuilder } from "../builders/HistorySummaryBuilder";

/**
 * Aggregate a HistorySummary from entries.
 * One responsibility: entries → HistorySummary.
 */
export class SummaryAggregator {
  aggregate(
    historyId: string,
    athleteId: string | null,
    entries: readonly HistoryEntry[],
  ): HistorySummary {
    return new HistorySummaryBuilder()
      .fromEntries(historyId, athleteId, entries)
      .build();
  }
}

export function createSummaryAggregator(): SummaryAggregator {
  return new SummaryAggregator();
}
