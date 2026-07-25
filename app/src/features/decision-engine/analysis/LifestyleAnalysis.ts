import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic lifestyle analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyzeLifestyle(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.conversation;
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: `candidate:lifestyle:continue`,
      category: DecisionCategories.LIFESTYLE,
      intent: DecisionIntents.CONTINUE,
      title: `Continue lifestyle orchestration`,
      priority: priorityForCategory(DecisionCategories.LIFESTYLE),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([`source:${slice.sourceKind} present`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "lifestyle.source_present",
          category: "lifestyle",
          statement: "Lifestyle source slice is available in unified context",
          evidenceKeys: Object.freeze(["conversation"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["conversation"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
