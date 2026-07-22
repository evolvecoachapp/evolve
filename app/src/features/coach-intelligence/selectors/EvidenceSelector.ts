import type { Insight } from "../../insight-engine/models/Insight";
import type { CoachEvidence } from "../models/CoachEvidence";
import { freezeEvidence } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";
import { sortEvidence } from "../utils/sortEvidence";

/**
 * Maps selected insights into CoachEvidence.
 * One responsibility: evidence extraction only.
 */
export class EvidenceSelector {
  select(insights: readonly Insight[]): readonly CoachEvidence[] {
    const evidence = insights.map((insight) =>
      freezeEvidence({
        id: `coach-evidence:${insight.id}`,
        sourceType: insight.evidence.sourceType,
        sourceId: insight.evidence.sourceId,
        statement: insight.statement,
        priority: normalizePriority(insight.priority),
        attributes: Object.freeze({
          insightId: insight.id,
          insightType: insight.type,
          insightCategory: insight.category,
          ...insight.evidence.attributes,
        }),
      }),
    );

    return Object.freeze(sortEvidence(evidence));
  }
}

export function createEvidenceSelector(): EvidenceSelector {
  return new EvidenceSelector();
}
