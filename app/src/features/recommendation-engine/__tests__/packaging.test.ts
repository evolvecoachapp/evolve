import { assembleRecommendations } from "../packaging/RecommendationAssembler";
  import { exportRecommendationOutput } from "../packaging/RecommendationExporter";
  import { formatRecommendationView } from "../packaging/RecommendationFormatter";
  import {
    createRecommendationInput,
    createTestRecommendationEngineService,
    FIXED_TIMESTAMP,
  } from "../testSupport/fixtures";

describe("recommendation-engine packaging", () => {
  it("packages view, collection, and explainability handoff", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    expect(built.package).not.toBeNull();
    expect(built.explainabilityInput).not.toBeNull();

    const view = formatRecommendationView({
      id: "view:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations: built.recommendations,
      groups: built.package!.groups,
      at: FIXED_TIMESTAMP,
    });
    expect(view.primary).not.toBeNull();
    expect(view.ordered.length).toBe(built.recommendations.length);

    const collection = assembleRecommendations({
      id: "collection:test",
      athleteId: "athlete:1",
      contextId: "context:athlete:1",
      recommendations: built.recommendations,
      at: FIXED_TIMESTAMP,
    });
    expect(collection.items.length).toBe(built.recommendations.length);

    const output = exportRecommendationOutput(built.package!);
    expect(output.explainabilityInput?.recommendationIds.length).toBe(
      built.recommendations.length,
    );
  });
});
