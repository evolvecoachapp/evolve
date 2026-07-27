import type { WeeklyConfidence } from "./WeeklyConfidence";
import type { WeeklyDecisionReport } from "./WeeklyDecisionReport";
import type { WeeklyEvidence } from "./WeeklyEvidence";
import type { WeeklyExecutiveSummary } from "./WeeklyExecutiveSummary";
import type { WeeklyGoalReport } from "./WeeklyGoalReport";
import type { WeeklyInsightReport } from "./WeeklyInsightReport";
import type { WeeklyNutritionReport } from "./WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "./WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "./WeeklyRecoveryReport";
import type { WeeklyWorkoutReport } from "./WeeklyWorkoutReport";

/**
 * Immutable Weekly Coach Report (Sprint 27.3).
 *
 * Deterministic composition of the athlete's week.
 * Not a PDF. Not a UI. Not an LLM summary.
 * No new AI engines. No duplicated business logic. Never mutate after creation.
 */
export interface WeeklyCoachReport {
  readonly id: string;
  readonly athleteId: string;
  readonly timestamp: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly executiveSummary: WeeklyExecutiveSummary;
  readonly workout: WeeklyWorkoutReport;
  readonly nutrition: WeeklyNutritionReport;
  readonly recovery: WeeklyRecoveryReport;
  readonly goals: WeeklyGoalReport;
  readonly insights: WeeklyInsightReport;
  readonly decisions: WeeklyDecisionReport;
  readonly recommendations: WeeklyRecommendationReport;
  readonly evidence: WeeklyEvidence;
  readonly confidence: WeeklyConfidence;
  readonly relatedDomains: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}
