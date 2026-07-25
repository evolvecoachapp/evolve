import type { DecisionCandidate } from "../models/DecisionCandidate";
import { DecisionCategories } from "../models/DecisionCategory";
import { DecisionIntents } from "../models/DecisionIntent";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionContext } from "../models/DecisionContext";
import { priorityForCategory } from "../utils/DecisionHelpers";
import { freezeCandidate } from "../utils/FreezeDecisionState";

/**
 * Deterministic risk analysis — missing safety-critical sources only.
 * No domain risk scoring.
 */
export function analyzeRisk(input: {
  readonly decisionContext: DecisionContext;
}): readonly DecisionCandidate[] {
  const ctx = input.decisionContext.unified;
  if (ctx.athlete && ctx.recovery) return Object.freeze([]);

  return Object.freeze([
    freezeCandidate({
      id: "candidate:safety:block_incomplete",
      category: DecisionCategories.SAFETY,
      intent: DecisionIntents.BLOCK,
      title: "Block incomplete safety context",
      priority: priorityForCategory(DecisionCategories.SAFETY),
      confidence: Object.freeze({
        level: "high" as const,
        score: 90,
        evidenceCount: 1,
        notes: Object.freeze(["missing athlete or recovery slice"]),
      }),
      reasons: Object.freeze([
        Object.freeze({
          code: "risk.incomplete_safety_sources",
          category: "safety",
          statement: "Athlete or recovery source missing from fused context",
          evidenceKeys: Object.freeze(["athlete", "recovery"]),
          metadata: EMPTY_DECISION_METADATA,
        }),
      ]),
      sourceKeys: Object.freeze(
        [ctx.athlete ? "athlete" : null, ctx.recovery ? "recovery" : null].filter(
          Boolean,
        ) as string[],
      ),
      metadata: EMPTY_DECISION_METADATA,
    }),
  ]);
}
