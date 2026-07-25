import type { DecisionPackage } from "../models/DecisionPackage";

export function applyConsistencyPolicy(
  pkg: DecisionPackage,
): readonly string[] {
  const warnings: string[] = [];
  if (pkg.candidates.length > 0 && pkg.evaluations.length === 0) {
    warnings.push("candidates_without_evaluations");
  }
  return Object.freeze(warnings);
}
