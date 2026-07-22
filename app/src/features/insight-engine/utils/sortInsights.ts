import type { Insight } from "../models/Insight";
import { INSIGHT_SEVERITY_ORDER } from "../models/InsightSeverity";

function severityRank(severity: Insight["severity"]): number {
  return INSIGHT_SEVERITY_ORDER.indexOf(severity);
}

/**
 * Sort insights by priority (desc), then severity (desc), then id (asc).
 */
export function sortInsights(insights: readonly Insight[]): readonly Insight[] {
  return [...insights].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    const severityDelta = severityRank(b.severity) - severityRank(a.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }
    return a.id.localeCompare(b.id);
  });
}
