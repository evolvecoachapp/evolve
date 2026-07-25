import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import { sortRecommendationsByPriority } from "../utils/RecommendationHelpers";

/**
 * Deterministic ordering — priority then dependency follows edges.
 */
export function resolveOrdering(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly dependencies: readonly RecommendationDependency[];
}): readonly CoachingRecommendation[] {
  const ordered = [...sortRecommendationsByPriority(input.recommendations)];
  const index = new Map(ordered.map((r, i) => [r.id, i]));
  for (const dep of input.dependencies) {
    if (dep.kind !== "follows") continue;
    const from = index.get(dep.fromId);
    const to = index.get(dep.toId);
    if (from === undefined || to === undefined) continue;
    if (from < to) continue;
    const [item] = ordered.splice(from, 1);
    const newTo = ordered.findIndex((r) => r.id === dep.toId);
    ordered.splice(newTo, 0, item);
    ordered.forEach((r, i) => index.set(r.id, i));
  }
  return Object.freeze(ordered);
}
