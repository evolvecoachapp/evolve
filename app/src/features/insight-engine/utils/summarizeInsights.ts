import type { InsightCollection } from "../models/InsightCollection";
import type { InsightSeverity } from "../models/InsightSeverity";
import { INSIGHT_SEVERITY_ORDER } from "../models/InsightSeverity";
import type { InsightSummary } from "../models/InsightSummary";
import { formatCountPhrase, formatSeverityLabel } from "./formatting";

function highestSeverity(
  collection: InsightCollection,
): InsightSeverity | null {
  let best: InsightSeverity | null = null;
  let bestRank = -1;

  for (const insight of collection.insights) {
    const rank = INSIGHT_SEVERITY_ORDER.indexOf(insight.severity);
    if (rank > bestRank) {
      bestRank = rank;
      best = insight.severity;
    }
  }

  return best;
}

/**
 * Build a compact InsightSummary from a collection.
 */
export function buildInsightSummary(options: {
  readonly snapshotId: string;
  readonly athleteId: string | null;
  readonly collection: InsightCollection;
  readonly topLimit?: number;
}): InsightSummary {
  const topLimit = options.topLimit ?? 3;
  const highest = highestSeverity(options.collection);
  const topInsightIds = options.collection.insights
    .slice(0, topLimit)
    .map((insight) => insight.id);

  const severityPhrase = highest
    ? ` Highest severity: ${formatSeverityLabel(highest)}.`
    : "";

  return Object.freeze({
    snapshotId: options.snapshotId,
    athleteId: options.athleteId,
    insightCount: options.collection.count,
    countsByType: Object.freeze({ ...options.collection.countsByType }),
    highestSeverity: highest,
    topInsightIds: Object.freeze([...topInsightIds]),
    summaryText: `${formatCountPhrase(
      options.collection.count,
      "deterministic insight",
    )}.${severityPhrase}`,
  });
}
