import type { Insight } from "../models/Insight";
import {
  INSIGHT_PRIORITY_DEFAULT,
  INSIGHT_PRIORITY_MAX,
  INSIGHT_PRIORITY_MIN,
} from "../models/InsightPriority";

/**
 * Clamp a priority into the valid 1–100 range.
 */
export function normalizePriority(priority: number): number {
  if (!Number.isFinite(priority)) {
    return INSIGHT_PRIORITY_DEFAULT;
  }
  return Math.min(
    INSIGHT_PRIORITY_MAX,
    Math.max(INSIGHT_PRIORITY_MIN, Math.round(priority)),
  );
}

/**
 * Return insights with normalized priorities (does not mutate input).
 */
export function normalizeInsightPriorities(
  insights: readonly Insight[],
): readonly Insight[] {
  return insights.map((insight) => {
    const priority = normalizePriority(insight.priority);
    if (priority === insight.priority) {
      return insight;
    }
    return Object.freeze({ ...insight, priority });
  });
}
