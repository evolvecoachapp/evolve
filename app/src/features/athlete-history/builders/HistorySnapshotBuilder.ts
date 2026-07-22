import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySnapshot } from "../models/HistorySnapshot";
import type { HistoryStatistics } from "../models/HistoryStatistics";
import type { HistorySummary } from "../models/HistorySummary";
import { entryTimeBounds } from "../utils/formatting";
import { freezeHistorySnapshot } from "../utils/freezeHistory";
import { normalizeHistoryEntries } from "../utils/normalizeHistory";

/**
 * Fluent builder for immutable HistorySnapshot.
 */
export class HistorySnapshotBuilder {
  private id = "";
  private historyId = "";
  private athleteId: string | null = null;
  private entries: readonly HistoryEntry[] = Object.freeze([]);
  private statistics: HistoryStatistics | null = null;
  private summary: HistorySummary | null = null;
  private createdAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

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

  withStatistics(statistics: HistoryStatistics): this {
    this.statistics = statistics;
    return this;
  }

  withSummary(summary: HistorySummary): this {
    this.summary = summary;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): HistorySnapshot {
    if (
      !this.id ||
      !this.historyId ||
      !this.statistics ||
      !this.summary ||
      !this.createdAt ||
      !this.frozenAt
    ) {
      throw new Error("HistorySnapshotBuilder missing required fields");
    }

    const entries = normalizeHistoryEntries(this.entries);
    const bounds = entryTimeBounds(entries);

    return freezeHistorySnapshot({
      id: this.id,
      historyId: this.historyId,
      athleteId: this.athleteId,
      entries,
      entryCount: entries.length,
      statistics: this.statistics,
      summary: this.summary,
      firstOccurredAt: bounds.firstOccurredAt,
      lastOccurredAt: bounds.lastOccurredAt,
      createdAt: this.createdAt,
      frozenAt: this.frozenAt,
    });
  }
}
