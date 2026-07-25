import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic goal analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyzeGoal(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.goal;
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: `candidate:goal:continue`,
      category: DecisionCategories.GOAL,
      intent: DecisionIntents.CONTINUE,
      title: `Continue goal orchestration`,
      priority: priorityForCategory(DecisionCategories.GOAL),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([`source:${slice.sourceKind} present`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "goal.source_present",
          category: "goal",
          statement: "Goal source slice is available in unified context",
          evidenceKeys: Object.freeze(["goal"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["goal"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
