import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine policies", () => {
  it("applies safety and priority policies deterministically", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const safe = applySafetyPolicy(built.recommendations);
    expect(safe.find((r) => r.category === "safety")?.intent).toBe("escalate");
    const prioritized = applyPriorityPolicy(safe);
    expect(prioritized[0]?.category).toBe("safety");
    const conflicts = applyConflictPolicy(prioritized);
    expect(conflicts.length).toBeGreaterThan(0);
  });
});
