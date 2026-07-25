import type { ExplanationDependency } from "../models/ExplanationDependency";
import { freezeDependency } from "../utils/FreezeExplanationState";

export function applyDependencyPolicy(
  dependencies: readonly ExplanationDependency[],
): readonly ExplanationDependency[] {
  return Object.freeze(dependencies.map(freezeDependency));
}
