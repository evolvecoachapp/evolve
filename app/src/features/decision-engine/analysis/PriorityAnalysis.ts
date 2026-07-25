import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic priority analysis — emit prioritize candidate when recovery present.
 */
export function analyzePriority(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  if (!input.decisionContext.unified.recovery) return Object.freeze([]);
  return Object.freeze([
    freezeCandidate({
      id: "candidate:recovery:prioritize",
      category: DecisionCategories.RECOVERY,
      intent: DecisionIntents.PRIORITIZE,
      title: "Prioritize recovery orchestration",
      priority: priorityForCategory(DecisionCategories.RECOVERY),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 70,
        evidenceCount: 1,
        notes: Object.freeze(["recovery source present"]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "priority.recovery_present",
          category: "recovery",
          statement: "Recovery source warrants priority consideration",
          evidenceKeys: Object.freeze(["recovery"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["recovery"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
