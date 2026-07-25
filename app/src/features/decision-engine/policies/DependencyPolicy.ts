import type { DecisionPackage } from "../models/DecisionPackage";

export function applyDependencyPolicy(
  pkg: DecisionPackage,
): readonly string[] {
  const ids = new Set(pkg.candidates.map((c) => c.id));
  const warnings: string[] = [];
  for (const dep of pkg.dependencies) {
    if (!ids.has(dep.fromId) || !ids.has(dep.toId)) {
      warnings.push(`dangling_dependency:${dep.id}`);
    }
  }
  return Object.freeze(warnings);
}
