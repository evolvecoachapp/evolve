import {
    createRecommendationInput,
    createTestRecommendationEngineService,
  } from "../testSupport/fixtures";
  import { validateRecommendationPackage } from "../validators/validateRecommendationPackage";
  import { validateRecommendationIntegrity } from "../validators/validateRecommendationIntegrity";

describe("recommendation-engine validators", () => {
  it("validates package integrity and context consistency", () => {
    const service = createTestRecommendationEngineService();
    const built = service.buildRecommendations(createRecommendationInput());
    const validation = validateRecommendationPackage(built.package!);
    expect(validation.valid).toBe(true);
    expect(validateRecommendationIntegrity(built.recommendations)).toEqual([]);
  });
});
