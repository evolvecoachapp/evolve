import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestRecommendationEngineService();
    const b = createTestRecommendationEngineService();
    const input = createRecommendationInput();
    const left = a.buildRecommendations(input);
    const right = b.buildRecommendations(input);
    expect(left.recommendations.map((r) => r.id)).toEqual(
      right.recommendations.map((r) => r.id),
    );
    expect(left.recommendations.map((r) => r.priority.ordinal)).toEqual(
      right.recommendations.map((r) => r.priority.ordinal),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("never attaches provider or network fields", () => {
    const service = createTestRecommendationEngineService();
    const result = service.buildRecommendations(createRecommendationInput());
    const serialized = JSON.stringify(result.package);
    expect(serialized).not.toMatch(/openai|anthropic|http:\/\/|https:\/\//i);
  });
});
