import type { InsightSeverity } from "./InsightSeverity";
import type { InsightType } from "./InsightType";

/**
 * Compact public summary of an insight snapshot.
 */
export interface InsightSummary {
  readonly snapshotId: string;
  readonly athleteId: string | null;
  readonly insightCount: number;
  readonly countsByType: Readonly<Partial<Record<InsightType, number>>>;
  readonly highestSeverity: InsightSeverity | null;
  readonly topInsightIds: readonly string[];
  readonly summaryText: string;
}
