import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic recovery analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyzeRecovery(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.recovery;
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: `candidate:recovery:continue`,
      category: DecisionCategories.RECOVERY,
      intent: DecisionIntents.CONTINUE,
      title: `Continue recovery orchestration`,
      priority: priorityForCategory(DecisionCategories.RECOVERY),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([`source:${slice.sourceKind} present`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "recovery.source_present",
          category: "recovery",
          statement: "Recovery source slice is available in unified context",
          evidenceKeys: Object.freeze(["recovery"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["recovery"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
