import type { AthleteHistory } from "../models/AthleteHistory";
import type { HistoryContext } from "../models/HistoryContext";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistoryMetadata } from "../models/HistoryMetadata";
import type { HistoryReference } from "../models/HistoryReference";
import { aggregateReferences } from "../utils/aggregateReferences";
import { freezeAthleteHistory } from "../utils/freezeHistory";
import { normalizeHistoryEntries } from "../utils/normalizeHistory";

/**
 * Fluent builder for immutable AthleteHistory.
 */
export class AthleteHistoryBuilder {
  private id = "";
  private athleteId: string | null = null;
  private entries: readonly HistoryEntry[] = Object.freeze([]);
  private references: readonly HistoryReference[] | null = null;
  private context: HistoryContext | null = null;
  private metadata: HistoryMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({} as Record<string, string | number | boolean>),
  });
  private builtAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
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

  withReferences(references: readonly HistoryReference[]): this {
    this.references = references;
    return this;
  }

  withContext(context: HistoryContext): this {
    this.context = context;
    return this;
  }

  withMetadata(metadata: HistoryMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withBuiltAt(builtAt: string): this {
    this.builtAt = builtAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): AthleteHistory {
    if (!this.id || !this.context || !this.builtAt || !this.frozenAt) {
      throw new Error("AthleteHistoryBuilder missing required fields");
    }

    const entries = normalizeHistoryEntries(this.entries);
    const references =
      this.references ?? aggregateReferences(entries);

    return freezeAthleteHistory({
      id: this.id,
      athleteId: this.athleteId,
      entries,
      entryCount: entries.length,
      references,
      context: this.context,
      metadata: this.metadata,
      builtAt: this.builtAt,
      frozenAt: this.frozenAt,
    });
  }
}
