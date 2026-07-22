import type { Insight } from "../../insight-engine/models/Insight";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import { InsightStatuses } from "../../insight-engine/models/InsightStatus";

export interface InsightSelection {
  readonly allInsightIds: readonly string[];
  readonly selectedInsights: readonly Insight[];
  readonly selectedInsightIds: readonly string[];
}

/**
 * Selects active insights from an InsightSnapshot.
 * One responsibility: insight selection only.
 */
export class InsightSelector {
  select(insightSnapshot: InsightSnapshot): InsightSelection {
    const allInsightIds = insightSnapshot.collection.insights.map((i) => i.id);
    const selectedInsights = insightSnapshot.collection.insights.filter(
      (insight) => insight.status === InsightStatuses.ACTIVE,
    );

    return Object.freeze({
      allInsightIds: Object.freeze([...allInsightIds]),
      selectedInsights: Object.freeze([...selectedInsights]),
      selectedInsightIds: Object.freeze(
        selectedInsights.map((insight) => insight.id),
      ),
    });
  }
}

export function createInsightSelector(): InsightSelector {
  return new InsightSelector();
}
