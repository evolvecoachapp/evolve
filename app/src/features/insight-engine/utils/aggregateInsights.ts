import type { Insight } from "../models/Insight";
import type { InsightCollection } from "../models/InsightCollection";
import type { InsightType } from "../models/InsightType";
import { normalizeInsightPriorities } from "./normalizePriorities";
import { sortInsights } from "./sortInsights";

/**
 * Aggregate insights into a frozen collection with type counts.
 */
export function aggregateInsights(
  insights: readonly Insight[],
): InsightCollection {
  const normalized = normalizeInsightPriorities(insights);
  const sorted = sortInsights(normalized);
  const countsByType: Partial<Record<InsightType, number>> = {};

  for (const insight of sorted) {
    countsByType[insight.type] = (countsByType[insight.type] ?? 0) + 1;
  }

  return Object.freeze({
    insights: Object.freeze([...sorted]),
    count: sorted.length,
    countsByType: Object.freeze({ ...countsByType }),
  });
}
