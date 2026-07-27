import type { CoachInsight } from "../../proactive-insights/models/CoachInsight";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { WeeklyInsightReport } from "../models/WeeklyInsightReport";

export interface BuildInsightReportInput {
  readonly insights?: readonly CoachInsight[];
  readonly limit?: number;
}

/**
 * Compose Weekly Coach Report insight section from Proactive Insights.
 * Prefers critical/high; surfaces weekly patterns and top insights.
 * No duplicated insight analysis.
 */
export function buildInsightReport(
  input: BuildInsightReportInput = {},
): WeeklyInsightReport {
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
      topInsights: Object.freeze([]),
      patternSummaries: Object.freeze([]),
      topRecommendation: null,
      summary: "No proactive insights this week.",
    });
  }

  const topInsights = Object.freeze(items.map((i) => i.title));
  const patternSummaries = Object.freeze(
    [...new Set(items.map((i) => i.domain))].map(
      (domain) => `Weekly pattern in ${domain}`,
    ),
  );

  const top = items[0]!;
  return Object.freeze({
    present: true,
    criticalCount,
    items,
    topInsights,
    patternSummaries,
    topRecommendation: top.recommendation,
    summary:
      criticalCount > 0
        ? `${criticalCount} critical insight(s) · ${top.title}`
        : `${items.length} insight(s) · ${top.title}`,
  });
}
