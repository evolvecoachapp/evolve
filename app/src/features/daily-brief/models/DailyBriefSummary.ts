import type { DailyBriefConfidence } from "./DailyBriefConfidence";
import type { DailyBriefPriority } from "./DailyBriefPriority";

/**
 * Deterministic Daily Brief summary for dashboard presentation.
 */
export interface DailyBriefSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly headline: string;
  readonly narrative: string;
  readonly highlights: readonly string[];
  readonly presentSectionCount: number;
  readonly insightCount: number;
  readonly priority: DailyBriefPriority;
  readonly confidence: DailyBriefConfidence;
  readonly generatedAt: string;
}
