import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic nutrition analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyzeNutrition(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.nutrition;
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: `candidate:nutrition:continue`,
      category: DecisionCategories.NUTRITION,
      intent: DecisionIntents.CONTINUE,
      title: `Continue nutrition orchestration`,
      priority: priorityForCategory(DecisionCategories.NUTRITION),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([`source:${slice.sourceKind} present`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "nutrition.source_present",
          category: "nutrition",
          statement: "Nutrition source slice is available in unified context",
          evidenceKeys: Object.freeze(["nutrition"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["nutrition"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
