import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic training analysis — structural presence only.
 * No domain calculations. No AI.
 */
export function analyzeTraining(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  const slice = ctx.workout;
  if (!slice) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: `candidate:training:continue`,
      category: DecisionCategories.TRAINING,
      intent: DecisionIntents.CONTINUE,
      title: `Continue training orchestration`,
      priority: priorityForCategory(DecisionCategories.TRAINING),
      confidence: Object.freeze({
        level: "medium" as const,
        score: 60,
        evidenceCount: 1,
        notes: Object.freeze([`source:${slice.sourceKind} present`]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "training.source_present",
          category: "training",
          statement: "Training source slice is available in unified context",
          evidenceKeys: Object.freeze(["workout"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(["workout"]),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
