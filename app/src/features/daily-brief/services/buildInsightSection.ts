import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";

export interface BuildInsightSectionInput {
  readonly insights?: readonly CoachInsight[];
  readonly limit?: number;
}

/**
 * Compose Daily Brief insights section from Proactive Insights.
 * Prefers critical/high; surfaces top recommendation.
 * No duplicated insight analysis.
 */
export function buildInsightSection(
  input: BuildInsightSectionInput = {},
): DailyBriefInsights {
  const insights = input.insights ?? Object.freeze([]);
  const limit = input.limit ?? 5;

  const severityRank: Record<string, number> = {
    [CoachInsightSeverities.CRITICAL]: 4,
    [CoachInsightSeverities.HIGH]: 3,
    [CoachInsightSeverities.MEDIUM]: 2,
    [CoachInsightSeverities.LOW]: 1,
  };

  const selected = [...insights].sort((a, b) => {
    const sr =
      (severityRank[b.severity] ?? 0) - (severityRank[a.severity] ?? 0);
    if (sr !== 0) return sr;
    return b.confidence - a.confidence;
  });

  const items = Object.freeze(
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

  const criticalCount = insights.filter(
    (i) => i.severity === CoachInsightSeverities.CRITICAL,
  ).length;

  if (items.length === 0) {
    return Object.freeze({
      present: false,
      criticalCount: 0,
      items: Object.freeze([]),
      topRecommendation: null,
      summary: "No proactive insights.",
    });
  }

  const top = items[0]!;
  return Object.freeze({
    present: true,
    criticalCount,
    items,
    topRecommendation: top.recommendation,
    summary:
      criticalCount > 0
        ? `${criticalCount} critical insight(s) · ${top.title}`
        : `${items.length} insight(s) · ${top.title}`,
  });
}
