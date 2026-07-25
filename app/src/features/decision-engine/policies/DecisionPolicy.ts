import type { DecisionPackage } from "../models/DecisionPackage";

export function applyDecisionPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  if (pkg.decisions.length === 0) {
    warnings.push("no_decisions_produced");
  }
  return Object.freeze(warnings);
}
