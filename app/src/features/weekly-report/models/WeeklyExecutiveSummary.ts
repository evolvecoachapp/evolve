import type { WeeklyConfidence } from "./WeeklyConfidence";

/**
 * Deterministic Weekly Coach Report executive summary.
 * Composed from Daily Brief, Home Experience, Coaching Session, and athlete status.
 */
export interface WeeklyExecutiveSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly headline: string;
  readonly narrative: string;
  readonly athleteStatus: string | null;
  readonly weeklyHighlights: readonly string[];
  readonly presentSectionCount: number;
  readonly insightCount: number;
  readonly decisionCount: number;
  readonly recommendationCount: number;
  readonly confidence: WeeklyConfidence;
  readonly generatedAt: string;
}
