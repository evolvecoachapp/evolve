import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { HomeInsightCard } from "../models/HomeInsightCard";

export interface BuildInsightCardInput {
  readonly insights?: readonly CoachInsight[];
  readonly criticalOnly?: boolean;
  readonly limit?: number;
}

/**
 * Compose Home insight cards from Proactive Insights.
 * Prefers critical/high when criticalOnly; otherwise top by severity then confidence.
 * No duplicated insight analysis.
 */
export function buildInsightCards(
  input: BuildInsightCardInput = {},
): readonly HomeInsightCard[] {
  const insights = input.insights ?? Object.freeze([]);
  const limit = input.limit ?? 5;

  const severityRank: Record<string, number> = {
    [CoachInsightSeverities.CRITICAL]: 4,
    [CoachInsightSeverities.HIGH]: 3,
    [CoachInsightSeverities.MEDIUM]: 2,
    [CoachInsightSeverities.LOW]: 1,
  };

  let selected = [...insights];
  if (input.criticalOnly) {
    selected = selected.filter(
      (i) =>
        i.severity === CoachInsightSeverities.CRITICAL ||
        i.severity === CoachInsightSeverities.HIGH,
    );
  }

  selected.sort((a, b) => {
    const sr =
      (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0);
    if (sr !== 0) return sr;
    return b.confidence - a.confidence;
  });

  return Object.freeze(
    selected.slice(0, limit).map((insight) =>
      Object.freeze({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        severity: insight.severity,
        domain: insight.affectedDomain,
        recommendation: insight.recommendation.action,
        expectedOutcome: insight.expectedOutcome,
      }),
    ),
  );
}

/** Single-card helper for tests / selectors. */
export function buildInsightCard(
  insight: CoachInsight,
): HomeInsightCard {
  return Object.freeze({
    id: insight.id,
    title: insight.title,
    summary: insight.summary,
    severity: insight.severity,
    domain: insight.affectedDomain,
    recommendation: insight.recommendation.action,
    expectedOutcome: insight.expectedOutcome,
  });
}
