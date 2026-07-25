import type { RecommendationDependency } from "../models/RecommendationDependency";

/**
 * Deterministic dependency policy — keep required blocking edges.
 */
export function applyDependencyPolicy(
  dependencies: readonly RecommendationDependency[],
): readonly RecommendationDependency[] {
  return Object.freeze(
    dependencies.filter((d) => d.required || d.kind === "follows"),
  );
}
