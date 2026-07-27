import type { CoachInsight } from "./CoachInsight";
import type { CoachInsightSummary } from "./CoachInsightSummary";

/**
 * Immutable snapshot of proactive coach insights at a point in time.
 */
export interface CoachInsightSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly insights: readonly CoachInsight[];
  readonly summary: CoachInsightSummary | null;
  readonly capturedAt: string;
  readonly insightCount: number;
}
