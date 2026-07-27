import type { CoachInsight } from "./CoachInsight";
import type { CoachInsightSnapshot } from "./CoachInsightSnapshot";
import type { CoachInsightSummary } from "./CoachInsightSummary";
import type { InsightQuery } from "./InsightQuery";

/**
 * Immutable result of a proactive insight analysis or query.
 */
export interface InsightAnalysisResult {
  readonly query: InsightQuery | null;
  readonly insights: readonly CoachInsight[];
  readonly snapshot: CoachInsightSnapshot | null;
  readonly summary: CoachInsightSummary | null;
  readonly matchedCount: number;
  readonly success: boolean;
  readonly message: string;
  readonly generatedAt: string;
}
