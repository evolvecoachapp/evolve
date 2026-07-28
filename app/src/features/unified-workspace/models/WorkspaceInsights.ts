import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import type { HomeInsightCard } from "../../home-experience/models/HomeInsightCard";

/**
 * Immutable insights projection from Proactive Insights and Home insight cards.
 */
export interface WorkspaceInsights {
  readonly athleteId: string;
  readonly present: boolean;
  readonly insights: readonly CoachInsight[];
  readonly homeInsightCards: readonly HomeInsightCard[];
  readonly currentPatterns: readonly string[];
  readonly criticalFindings: readonly CoachInsight[];
  readonly summary: string;
}
