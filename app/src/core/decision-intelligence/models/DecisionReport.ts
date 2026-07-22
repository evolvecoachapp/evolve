import type { DecisionCategory } from "./DecisionCategory";
import type { DecisionGraph } from "./DecisionGraph";
import type { DecisionTimeline } from "./DecisionTimeline";
import type { ExplanationReport } from "./DecisionExplanation";

/**
 * Aggregated counts by category for a decision report.
 */
export interface DecisionSummary {
  readonly totalDecisions: number;
  readonly byCategory: Readonly<Record<DecisionCategory, number>>;
  readonly averageConfidence: number;
  readonly highSeverityCount: number;
  readonly rootCount: number;
  readonly edgeCount: number;
}

/**
 * Immutable decision intelligence report for one generation.
 */
export interface DecisionReport {
  readonly reportId: string;
  readonly generationId: string;
  readonly graph: DecisionGraph;
  readonly timeline: DecisionTimeline;
  readonly summary: DecisionSummary;
  readonly explanations: ExplanationReport;
  readonly validationIssues: readonly string[];
  /** ISO-8601 — fixed by builder for determinism when provided. */
  readonly createdAt: string;
}
