import type { CoachInsight } from "../models/CoachInsight";
import type { CoachRecommendation } from "../models/CoachRecommendation";
import type { CoachSummary } from "../models/CoachSummary";
import type { RiskFlag } from "../models/RiskFlag";

/** Full structured coach intelligence bundle. */
export interface CoachIntelligenceSnapshot {
  readonly summary: CoachSummary;
  readonly insights: readonly CoachInsight[];
  readonly riskFlags: readonly RiskFlag[];
  readonly recommendations: readonly CoachRecommendation[];
}

/**
 * Read-only coach intelligence derived from analytics, records, and history.
 *
 * Implementations must consume existing domain repositories and must never
 * call LLM providers, networking, or AsyncStorage directly.
 */
export interface CoachIntelligenceRepository {
  /** Full structured bundle (preferred for hooks — single compute pass). */
  getSnapshot(referenceDate?: Date): Promise<CoachIntelligenceSnapshot>;

  /** Aggregate structured coaching summary. */
  getCoachSummary(referenceDate?: Date): Promise<CoachSummary>;

  /** All structured insights for the current training state. */
  getInsights(referenceDate?: Date): Promise<readonly CoachInsight[]>;

  /** Structured risk flags only. */
  getRiskFlags(referenceDate?: Date): Promise<readonly RiskFlag[]>;

  /** Structured recommendations derived from insights and risks. */
  getRecommendations(
    referenceDate?: Date,
  ): Promise<readonly CoachRecommendation[]>;
}
