import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionConstraint } from "../models/DecisionConstraint";

/**
 * Deterministic constraint evaluation — blocking keys only.
 */
export function evaluateConstraints(input: {
  readonly candidate: DecisionCandidate;
  readonly constraints: readonly DecisionConstraint[];
}): readonly string[] {
  const violations: string[] = [];
  for (const constraint of input.constraints) {
    if (!constraint.blocking) continue;
    const hit = constraint.subjectKeys.some((k) =>
      input.candidate.sourceKeys.includes(k) ||
      input.candidate.id === k ||
      input.candidate.category === k,
    );
    if (hit && constraint.kind === "mutual_exclusion") {
      violations.push(constraint.id);
    }
  }
  return Object.freeze(violations);
}
