import type { DecisionCandidate } from "../models/DecisionCandidate";
import type { DecisionDependency } from "../models/DecisionDependency";

/**
 * Deterministic dependency evaluation — missing required targets.
 */
export function evaluateDependencies(input: {
  readonly candidates: readonly DecisionCandidate[];
  readonly dependencies: readonly DecisionDependency[];
}): readonly string[] {
  const ids = new Set(input.candidates.map((c) => c.id));
  const missing: string[] = [];
  for (const dep of input.dependencies) {
    if (!dep.required) continue;
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      missing.push(dep.id);
    }
  }
  return Object.freeze(missing);
}
