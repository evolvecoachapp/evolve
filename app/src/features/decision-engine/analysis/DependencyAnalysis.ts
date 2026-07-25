import type { DecisionDependency } from "../models/DecisionDependency";
import { DecisionDependencyKinds } from "../models/DecisionDependency";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import { freezeDependency } from "../utils/FreezeDecisionState";

/**
 * Deterministic dependency analysis — structural edges only.
 */
export function analyzeDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
}): readonly DecisionDependency[] {
  const deps: DecisionDependency[] = [];
  const recovery = input.candidates.find((c) => c.category === "recovery");
  const training = input.candidates.find((c) => c.category === "training");
  if (recovery && training) {
    deps.push(
      freezeDependency({
        id: "dep:training-requires-recovery",
        kind: DecisionDependencyKinds.REQUIRES,
        fromId: training.id,
        toId: recovery.id,
        required: true,
        metadata: EMPTY_DECISION_METADATA,
      }),
    );
  }
  return Object.freeze(deps);
}
