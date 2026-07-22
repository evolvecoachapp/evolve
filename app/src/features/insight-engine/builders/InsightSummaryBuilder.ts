import type { InsightSeverity } from "../models/InsightSeverity";
import type { InsightSummary } from "../models/InsightSummary";
import type { InsightType } from "../models/InsightType";
import { freezeSummary } from "../utils/freezeSnapshots";

/**
 * Fluent builder for immutable InsightSummary.
 */
export class InsightSummaryBuilder {
  private snapshotId = "";
  private athleteId: string | null = null;
  private insightCount = 0;
  private countsByType: Partial<Record<InsightType, number>> = {};
  private highestSeverity: InsightSeverity | null = null;
  private topInsightIds: readonly string[] = [];
  private summaryText = "";

  withIds(ids: {
    readonly snapshotId: string;
    readonly athleteId: string | null;
  }): this {
    this.snapshotId = ids.snapshotId;
    this.athleteId = ids.athleteId;
    return this;
  }

  withInsightCount(count: number): this {
    this.insightCount = count;
    return this;
  }

  withCountsByType(counts: Partial<Record<InsightType, number>>): this {
    this.countsByType = counts;
    return this;
  }

  withHighestSeverity(severity: InsightSeverity | null): this {
    this.highestSeverity = severity;
    return this;
  }

  withTopInsightIds(ids: readonly string[]): this {
    this.topInsightIds = ids;
    return this;
  }

  withSummaryText(text: string): this {
    this.summaryText = text;
    return this;
  }

  build(): InsightSummary {
    if (!this.snapshotId || !this.summaryText) {
      throw new Error("InsightSummaryBuilder missing required fields");
    }

    return freezeSummary({
      snapshotId: this.snapshotId,
      athleteId: this.athleteId,
      insightCount: this.insightCount,
      countsByType: Object.freeze({ ...this.countsByType }),
      highestSeverity: this.highestSeverity,
      topInsightIds: Object.freeze([...this.topInsightIds]),
      summaryText: this.summaryText,
    });
  }
}
