import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { freezeRecommendation } from "../utils/FreezeRecommendationState";

/**
 * Deterministic dependency resolution — attach required deps; defer blocked.
 */
export function resolveDependencies(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly CoachingRecommendation[] {
  const blocked = new Set<string>();
  for (const dep of input.dependencies) {
    if (dep.kind === "blocks" && dep.required) {
      blocked.add(dep.toId);
    }
  }
  return Object.freeze(
    input.recommendations.map((r) => {
      if (!blocked.has(r.id)) return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        intent: "defer",
        metadata: Object.freeze({
          tags: Object.freeze([...r.metadata.tags, "blocked_by_dependency"]),
          attributes: Object.freeze({ ...r.metadata.attributes }),
        }),
      });
    }),
  );
}
