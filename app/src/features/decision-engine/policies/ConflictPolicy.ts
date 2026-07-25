import type { DecisionPackage } from "../models/DecisionPackage";

export function applyConflictPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  const unresolved = pkg.conflicts.filter((c) => !c.resolved);
  if (unresolved.length > 0) {
    warnings.push(`unresolved_conflicts:${unresolved.length}`);
  }
  return Object.freeze(warnings);
}
