import { planActions } from "../planning/ActionPlanner";
import { planDependencies } from "../planning/DependencyPlanner";
import { planGroups } from "../planning/GroupingPlanner";
import { planRecommendations } from "../planning/RecommendationPlanner";
import { planSequences } from "../planning/SequencePlanner";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recommendation-engine planning", () => {
  it("plans groups, dependencies, sequences, and ordered ids", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const recommendations = built.recommendations;

    const plan = planRecommendations({
      planId: "plan:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations,
      at: FIXED_TIMESTAMP,
    });
    expect(plan.orderedIds.length).toBe(recommendations.length);

    const groups = planGroups(recommendations);
    expect(groups.length).toBeGreaterThan(0);

    const deps = planDependencies(recommendations);
    expect(deps.some((d) => d.kind === "blocks")).toBe(true);

    const steps = planActions(recommendations);
    expect(steps.length).toBeGreaterThan(0);

    const sequences = planSequences(recommendations);
    expect(sequences[0]?.ordered).toBe(true);
  });
});
