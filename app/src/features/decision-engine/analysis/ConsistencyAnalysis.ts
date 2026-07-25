import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { presentSourceKeys, priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic consistency analysis — source-set structural checks only.
 */
export function analyzeConsistency(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const keys = presentSourceKeys(input.decisionContext.unified);
  if (keys.length >= 2) {
    return Object.freeze([
      freezeCandidate({
        id: "candidate:orchestration:consistency",
        category: DecisionCategories.ORCHESTRATION,
        intent: DecisionIntents.CONTINUE,
        title: "Maintain multi-source consistency",
        priority: priorityForCategory(DecisionCategories.ORCHESTRATION),
        confidence: Object.freeze({
          level: "high" as const,
          score: 80,
          evidenceCount: keys.length,
          notes: Object.freeze([`sources=${keys.length}`]),
        }),
        reasons: Object.freeze([
          Object.freeze({
            code: "consistency.multi_source",
            category: "orchestration",
            statement: "Multiple fused sources are present",
            evidenceKeys: keys,
            metadata: EMPTY_DECISION_METADATA,
          }),
        ]),
        sourceKeys: keys,
        metadata: EMPTY_DECISION_METADATA,
      }),
    ]);
  }
  return Object.freeze([]);
}
