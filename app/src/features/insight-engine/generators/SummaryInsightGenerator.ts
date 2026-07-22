import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import type { InsightType } from "../models/InsightType";
import { InsightTypes } from "../models/InsightType";
import { formatCountPhrase } from "../utils/formatting";

export interface SummaryInsightGenerator {
  generate(options: {
    readonly insights: readonly Insight[];
    readonly snapshotId: string;
    readonly generatedAt: string;
  }): readonly Insight[];
}

/**
 * Emits a deterministic aggregate summary insight over generated facts.
 */
export class DefaultSummaryInsightGenerator implements SummaryInsightGenerator {
  generate(options: {
    readonly insights: readonly Insight[];
    readonly snapshotId: string;
    readonly generatedAt: string;
  }): readonly Insight[] {
    const { insights, snapshotId, generatedAt } = options;
    const countsByType: Partial<Record<InsightType, number>> = {};

    for (const insight of insights) {
      countsByType[insight.type] = (countsByType[insight.type] ?? 0) + 1;
    }

    const domainCount =
      (countsByType[InsightTypes.PERFORMANCE] ?? 0) +
      (countsByType[InsightTypes.ACHIEVEMENT] ?? 0) +
      (countsByType[InsightTypes.RECOVERY] ?? 0) +
      (countsByType[InsightTypes.HISTORY] ?? 0);

    return Object.freeze([
      new InsightBuilder()
        .withId(`insight:summary:aggregate:${snapshotId}`)
        .withType(InsightTypes.SUMMARY)
        .withCategory(InsightCategories.AGGREGATE)
        .withSeverity(InsightSeverities.INFO)
        .withPriority(30)
        .withTitle("Insight aggregate")
        .withStatement(
          `Aggregated ${formatCountPhrase(domainCount, "domain insight")} from performance, achievement, recovery, and history.`,
        )
        .withReason({
          code: "insight_aggregate_observed",
          statement: "Aggregate count of domain insights before summary",
          attributes: Object.freeze({
            domainInsightCount: domainCount,
            performance: countsByType[InsightTypes.PERFORMANCE] ?? 0,
            achievement: countsByType[InsightTypes.ACHIEVEMENT] ?? 0,
            recovery: countsByType[InsightTypes.RECOVERY] ?? 0,
            history: countsByType[InsightTypes.HISTORY] ?? 0,
          }),
        })
        .withEvidence({
          sourceType: "InsightCollection",
          sourceId: snapshotId,
          attributes: Object.freeze({
            domainInsightCount: domainCount,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["summary", "aggregate"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    ]);
  }
}

export function createSummaryInsightGenerator(): SummaryInsightGenerator {
  return new DefaultSummaryInsightGenerator();
}
