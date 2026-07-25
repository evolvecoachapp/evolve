import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { resolveConflicts } from "../prioritization/ConflictResolver";
import { resolveOrdering } from "../prioritization/OrderingResolver";
import { resolvePriorities } from "../prioritization/PriorityResolver";
import { resolveUrgency } from "../prioritization/UrgencyResolver";
import { planDependencies } from "../planning/DependencyPlanner";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine prioritization", () => {
  it("orders safety first and resolves conflicts deterministically", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    let recommendations = resolveUrgency(built.recommendations);
    recommendations = resolvePriorities(recommendations);
    expect(recommendations[0]?.category).toBe("safety");

    const dependencies = planDependencies(recommendations);
    const ordered = resolveOrdering({ recommendations, dependencies });
    expect(ordered.map((r) => r.id).sort()).toEqual(
      recommendations.map((r) => r.id).sort(),
    );

    const conflicts = applyConflictPolicy(recommendations);
    const resolved = resolveConflicts({ recommendations, conflicts });
    expect(resolved.conflicts.every((c) => c.resolved)).toBe(true);
    expect(resolved.resolutions.length).toBe(conflicts.length);
  });
});
