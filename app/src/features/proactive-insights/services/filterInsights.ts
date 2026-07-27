import type { CoachInsight } from "../models/CoachInsight";
import type { InsightFilter } from "../models/InsightFilter";

/**
 * Filter insights by type / severity / domain / confidence / time / text.
 * One responsibility only.
 */
export function filterInsights(
  insights: readonly CoachInsight[],
  filter: InsightFilter | null | undefined,
): readonly CoachInsight[] {
  if (!filter) return Object.freeze([...insights]);

  const types = filter.types ? new Set(filter.types) : null;
  const severities = filter.severities ? new Set(filter.severities) : null;
  const domains = filter.domains ? new Set(filter.domains) : null;
  const minConfidence = filter.minConfidence ?? null;
  const since = filter.since ?? null;
  const until = filter.until ?? null;
  const search = filter.searchText?.trim().toLowerCase() ?? null;

  const filtered = insights.filter((insight) => {
    if (types && !types.has(insight.type)) return false;
    if (severities && !severities.has(insight.severity)) return false;
    if (domains && !domains.has(insight.affectedDomain)) return false;
    if (minConfidence != null && insight.confidence < minConfidence) {
      return false;
    }
    if (since && insight.timestamp < since) return false;
    if (until && insight.timestamp > until) return false;
    if (search) {
      const blob = [
        insight.title,
        insight.summary,
        insight.reason.reason,
        insight.recommendation.action,
        insight.type,
        insight.affectedDomain,
      ]
        .join(" ")
        .toLowerCase();
      if (!blob.includes(search)) return false;
    }
    return true;
  });

  return Object.freeze(filtered);
}
