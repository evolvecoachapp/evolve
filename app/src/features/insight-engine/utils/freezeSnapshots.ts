import type { Insight } from "../models/Insight";
import type { InsightCollection } from "../models/InsightCollection";
import type { InsightEngineResult } from "../models/InsightEngineResult";
import type { InsightSnapshot } from "../models/InsightSnapshot";
import type { InsightSummary } from "../models/InsightSummary";

export function freezeInsight(insight: Insight): Insight {
  return Object.freeze({
    ...insight,
    reason: Object.freeze({
      ...insight.reason,
      attributes: Object.freeze({ ...insight.reason.attributes }),
    }),
    evidence: Object.freeze({
      ...insight.evidence,
      attributes: Object.freeze({ ...insight.evidence.attributes }),
    }),
    metadata: Object.freeze({
      tags: Object.freeze([...insight.metadata.tags]),
      attributes: Object.freeze({ ...insight.metadata.attributes }),
    }),
  });
}

export function freezeCollection(
  collection: InsightCollection,
): InsightCollection {
  return Object.freeze({
    insights: Object.freeze(collection.insights.map(freezeInsight)),
    count: collection.count,
    countsByType: Object.freeze({ ...collection.countsByType }),
  });
}

export function freezeSummary(summary: InsightSummary): InsightSummary {
  return Object.freeze({
    ...summary,
    countsByType: Object.freeze({ ...summary.countsByType }),
    topInsightIds: Object.freeze([...summary.topInsightIds]),
  });
}

/**
 * Deep-freeze an insight snapshot for immutability guarantees.
 */
export function freezeSnapshot(snapshot: InsightSnapshot): InsightSnapshot {
  return Object.freeze({
    ...snapshot,
    context: Object.freeze({ ...snapshot.context }),
    collection: freezeCollection(snapshot.collection),
    summary: freezeSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: InsightEngineResult,
): InsightEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    collection: freezeCollection(result.collection),
    summary: freezeSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
