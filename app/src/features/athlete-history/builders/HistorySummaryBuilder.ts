import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySummary } from "../models/HistorySummary";
import { summarizeHistoryEntries } from "../utils/summarizeHistory";

/**
 * Fluent builder for immutable HistorySummary.
 */
export class HistorySummaryBuilder {
  private historyId = "";
  private athleteId: string | null = null;
  private entries: readonly HistoryEntry[] = Object.freeze([]);
  private summaryText: string | null = null;

  withHistoryId(historyId: string): this {
    this.historyId = historyId;
    return this;
  }

  withAthleteId(athleteId: string | null): this {
    this.athleteId = athleteId;
    return this;
  }

  withEntries(entries: readonly HistoryEntry[]): this {
    this.entries = entries;
    return this;
  }

  withSummaryText(summaryText: string): this {
    this.summaryText = summaryText;
    return this;
  }

  fromEntries(
    historyId: string,
    athleteId: string | null,
    entries: readonly HistoryEntry[],
  ): this {
    this.historyId = historyId;
    this.athleteId = athleteId;
    this.entries = entries;
    this.summaryText = null;
    return this;
  }

  build(): HistorySummary {
    if (!this.historyId) {
      throw new Error("HistorySummaryBuilder missing required fields");
    }

    const summary = summarizeHistoryEntries(
      this.historyId,
      this.athleteId,
      this.entries,
    );

    if (this.summaryText !== null) {
      return Object.freeze({
        ...summary,
        summaryText: this.summaryText,
      });
    }

    return summary;
  }
}
