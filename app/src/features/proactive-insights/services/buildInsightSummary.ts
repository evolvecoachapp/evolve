import type { CoachInsight } from "../models/CoachInsight";
import type { CoachInsightSummary } from "../models/CoachInsightSummary";
import {
  CoachInsightSummaryKinds,
  type CoachInsightSummaryKind,
} from "../models/CoachInsightSummary";
import type { CoachInsightSeverity } from "../models/CoachInsightSeverity";
import type { CoachInsightType } from "../models/CoachInsightType";

/**
 * Build a deterministic insight summary. One responsibility only.
 */
export function buildInsightSummary(input: {
  readonly insights: readonly CoachInsight[];
  readonly kind: CoachInsightSummaryKind;
  readonly generatedAt: string;
}): CoachInsightSummary {
  const typeCounts: Partial<Record<CoachInsightType, number>> = {};
  const severityCounts: Partial<Record<CoachInsightSeverity, number>> = {};
  for (const insight of input.insights) {
    typeCounts[insight.type] = (typeCounts[insight.type] ?? 0) + 1;
    severityCounts[insight.severity] =
      (severityCounts[insight.severity] ?? 0) + 1;
  }

  const titles = input.insights.slice(0, 3).map((insight) => insight.title);
  const narrative =
    input.insights.length === 0
      ? "No proactive coach insights matched this summary."
      : `Found ${input.insights.length} insight(s). Top: ${titles.join("; ")}.`;

  const kindTitle: Record<CoachInsightSummaryKind, string> = {
    [CoachInsightSummaryKinds.TOP]: "Top Insights",
    [CoachInsightSummaryKinds.LATEST]: "Latest Insights",
    [CoachInsightSummaryKinds.CRITICAL]: "Critical Insights",
    [CoachInsightSummaryKinds.RECOVERY]: "Recovery Insights",
    [CoachInsightSummaryKinds.GOAL]: "Goal Insights",
    [CoachInsightSummaryKinds.WORKOUT]: "Workout Insights",
    [CoachInsightSummaryKinds.NUTRITION]: "Nutrition Insights",
    [CoachInsightSummaryKinds.ALL]: "All Insights",
  };

  return Object.freeze({
    id: `insight-summary:${input.kind}:${input.generatedAt}`,
    kind: input.kind,
    title: kindTitle[input.kind],
    narrative,
    insightIds: Object.freeze(input.insights.map((insight) => insight.id)),
    typeCounts: Object.freeze({ ...typeCounts }),
    severityCounts: Object.freeze({ ...severityCounts }),
    generatedAt: input.generatedAt,
  });
}
