import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";

export interface HistoryInsightGenerator {
  generate(options: {
    readonly athleteHistory: AthleteHistory;
    readonly generatedAt: string;
  }): readonly Insight[];
}

/**
 * Emits deterministic history facts from AthleteHistory.
 */
export class DefaultHistoryInsightGenerator implements HistoryInsightGenerator {
  generate(options: {
    readonly athleteHistory: AthleteHistory;
    readonly generatedAt: string;
  }): readonly Insight[] {
    const { athleteHistory: history, generatedAt } = options;
    const insights: Insight[] = [];

    insights.push(
      new InsightBuilder()
        .withId(`insight:hist:count:${history.id}`)
        .withType(InsightTypes.HISTORY)
        .withCategory(InsightCategories.HISTORY_VOLUME)
        .withSeverity(
          history.entryCount === 0
            ? InsightSeverities.NOTABLE
            : InsightSeverities.INFO,
        )
        .withPriority(45)
        .withTitle("History entry count")
        .withStatement(`Athlete history entry count is ${history.entryCount}.`)
        .withReason({
          code: "history_entry_count_observed",
          statement: "Count taken from AthleteHistory.entryCount",
          attributes: Object.freeze({ entryCount: history.entryCount }),
        })
        .withEvidence({
          sourceType: "AthleteHistory",
          sourceId: history.id,
          attributes: Object.freeze({
            entryCount: history.entryCount,
            referenceCount: history.references.length,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["history", "volume"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    const typeCounts: Record<string, number> = {};
    for (const entry of history.entries) {
      typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1;
    }
    const composition = Object.keys(typeCounts)
      .sort()
      .map((type) => `${type}:${typeCounts[type]}`)
      .join(", ");

    insights.push(
      new InsightBuilder()
        .withId(`insight:hist:composition:${history.id}`)
        .withType(InsightTypes.HISTORY)
        .withCategory(InsightCategories.HISTORY_COMPOSITION)
        .withSeverity(InsightSeverities.INFO)
        .withPriority(40)
        .withTitle("History composition")
        .withStatement(
          composition
            ? `Athlete history composition is ${composition}.`
            : "Athlete history composition is empty.",
        )
        .withReason({
          code: "history_composition_observed",
          statement: "Composition derived from AthleteHistory.entries types",
          attributes: Object.freeze({
            distinctTypes: Object.keys(typeCounts).length,
          }),
        })
        .withEvidence({
          sourceType: "AthleteHistory",
          sourceId: history.id,
          attributes: Object.freeze({
            composition: composition || null,
            distinctTypes: Object.keys(typeCounts).length,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["history", "composition"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    return Object.freeze(insights);
  }
}

export function createHistoryInsightGenerator(): HistoryInsightGenerator {
  return new DefaultHistoryInsightGenerator();
}
