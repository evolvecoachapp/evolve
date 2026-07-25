import {
  buildRecommendations,
  describeRecommendations,
  packageRecommendations,
  prioritizeRecommendations,
  validateRecommendations,
} from "../application";
import { RecommendationInputKinds } from "../models/RecommendationInput";
import { RecommendationOperationKinds } from "../models/RecommendationResult";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine application", () => {
  it("exposes public API build → prioritize → package → validate → describe", () => {
    const service = createTestRecommendationEngineService();

    const built = buildRecommendations({
      service,
      input: createRecommendationInput({ kind: RecommendationInputKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(RecommendationOperationKinds.BUILD);
    expect(built.explainabilityInput).not.toBeNull();
    expect(Object.isFrozen(built.recommendations[0])).toBe(true);

    const prioritized = prioritizeRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:prioritize",
        kind: RecommendationInputKinds.PRIORITIZE,
      }),
    });
    expect(prioritized.success).toBe(true);
    expect(prioritized.operation).toBe(RecommendationOperationKinds.PRIORITIZE);

    const packaged = packageRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:package",
        kind: RecommendationInputKinds.PACKAGE,
      }),
    });
    expect(packaged.success).toBe(true);
    expect(packaged.operation).toBe(RecommendationOperationKinds.PACKAGE);

    const validated = validateRecommendations({
      service,
      input: createRecommendationInput({
        id: "request:validate",
        kind: RecommendationInputKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(RecommendationOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);

    const caps = describeRecommendations({ service });
    expect(caps.name).toBe("Recommendation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildRecommendations",
        "prioritizeRecommendations",
        "packageRecommendations",
        "describeRecommendations",
        "validateRecommendations",
      ]),
    );
  });
});
