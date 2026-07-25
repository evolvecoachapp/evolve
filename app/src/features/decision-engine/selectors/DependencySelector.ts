import type { DecisionDependency } from "../models/DecisionDependency";

export function selectRequiredDependencies(
  dependencies: readonly DecisionDependency[],
): readonly DecisionDependency[] {
  return Object.freeze(dependencies.filter((d) => d.required));
}
