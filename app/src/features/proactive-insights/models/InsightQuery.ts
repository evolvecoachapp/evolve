import type { InsightFilter } from "./InsightFilter";
import type { CoachInsightSummaryKind } from "./CoachInsightSummary";

/**
 * Immutable query for proactive coach insights.
 */
export interface InsightQuery {
  readonly athleteId: string;
  readonly filter: InsightFilter | null;
  readonly order: "desc" | "asc" | "priority";
  readonly limit: number | null;
  readonly summaryKind: CoachInsightSummaryKind | null;
}
