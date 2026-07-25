import { buildDecision } from "../../decision-engine/application";
import { DecisionInputKinds } from "../../decision-engine/models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../../decision-engine/testSupport/fixtures";
import { buildRecommendations } from "../application";
import { RecommendationInputKinds } from "../models/RecommendationInput";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../testSupport/fixtures";

describe("recommendation-engine integration", () => {
  it("consumes Decision Engine CoachingDecision / RecommendationEngineInput", () => {
    const decisionService = createTestDecisionEngineService();
    const decided = buildDecision({
      service: decisionService,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(decided.success).toBe(true);
    expect(decided.decisions.length).toBeGreaterThan(0);

    const recService = createTestRecommendationEngineService({
      withMocks: false,
    });
    const result = buildRecommendations({
      service: recService,
      input: createRecommendationInput({
        kind: RecommendationInputKinds.BUILD,
        decisions: decided.decisions,
        decisionHandoff: decided.recommendationInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
      }),
    });

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(result.explainabilityInput).not.toBeNull();
    expect(
      result.recommendations.every(
        (r) => r.contextId === decided.decisions[0]!.contextId,
      ),
    ).toBe(true);
  });
});
