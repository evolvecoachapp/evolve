import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConflict } from "../models/DecisionConflict";
import { DecisionConflictKinds } from "../models/DecisionConflict";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeConflict } from "../utils/FreezeDecisionState";

/**
 * Deterministic conflict detection — mutual exclusion by category intents.
 */
export function evaluateConflicts(input: {
  readonly candidates: readonly DecisionCandidate[];
}): readonly DecisionConflict[] {
  const conflicts: DecisionConflict[] = [];
  const byCategory = new Map<string, DecisionCandidate[]>();
  for (const c of input.candidates) {
    const list = byCategory.get(c.category) ?? [];
    list.push(c);
    byCategory.set(c.category, list);
  }
  for (const [category, list] of byCategory) {
    const prioritize = list.find((c) => c.intent === "prioritize");
    const defer = list.find((c) => c.intent === "defer" || c.intent === "block");
    if (prioritize && defer) {
      conflicts.push(
        freezeConflict({
          id: `conflict:${category}:priority`,
          kind: DecisionConflictKinds.PRIORITY,
          leftId: prioritize.id,
          rightId: defer.id,
          description: `Priority conflict in ${category}`,
          resolved: false,
          metadata: EMPTY_DECISION_METADATA,
        }),
      );
    }
  }
  // Cross-category: safety block vs training continue
  const safetyBlock = input.candidates.find(
    (c) => c.category === "safety" && c.intent === "block",
  );
  const training = input.candidates.find((c) => c.category === "training");
  if (safetyBlock && training) {
    conflicts.push(
      freezeConflict({
        id: "conflict:safety-vs-training",
        kind: DecisionConflictKinds.MUTUAL_EXCLUSION,
        leftId: safetyBlock.id,
        rightId: training.id,
        description: "Safety block conflicts with training continue",
        resolved: false,
        metadata: EMPTY_DECISION_METADATA,
      }),
    );
  }
  return Object.freeze(conflicts);
}
