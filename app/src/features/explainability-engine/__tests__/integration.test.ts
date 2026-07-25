import { buildDecision } from "../../decision-engine/application";
import { DecisionInputKinds } from "../../decision-engine/models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../../decision-engine/testSupport/fixtures";
import { buildRecommendations } from "../../recommendation-engine/application";
import { RecommendationInputKinds } from "../../recommendation-engine/models/RecommendationInput";
import {
  createRecommendationInput,
  createTestRecommendationEngineService,
} from "../../recommendation-engine/testSupport/fixtures";
import { buildExplanation } from "../application";
import { ExplanationInputKinds } from "../models/ExplanationInput";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("explainability-engine integration", () => {
  it("consumes recommendation-engine output and produces CoachingExplanation + LLMFormatterInput", () => {
    const decisionService = createTestDecisionEngineService();
    const decided = buildDecision({
      service: decisionService,
      input: createDecisionInput({ kind: DecisionInputKinds.BUILD }),
    });
    expect(decided.success).toBe(true);

    const recService = createTestRecommendationEngineService({ withMocks: false });
    const recResult = buildRecommendations({
      service: recService,
      input: createRecommendationInput({
        kind: RecommendationInputKinds.BUILD,
        decisions: decided.decisions,
        decisionHandoff: decided.recommendationInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
      }),
    });
    expect(recResult.success).toBe(true);
    expect(recResult.explainabilityInput).not.toBeNull();

    const explainService = createTestExplainabilityEngineService({ withMocks: false });
    const explainResult = buildExplanation({
      service: explainService,
      input: createExplanationInput({
        kind: ExplanationInputKinds.BUILD,
        decisions: decided.decisions,
        recommendations: recResult.recommendations,
        explainabilityHandoff: recResult.explainabilityInput,
        athleteId: decided.decisions[0]!.athleteId,
        contextId: decided.decisions[0]!.contextId,
        createdAt: FIXED_TIMESTAMP,
      }),
    });

    expect(explainResult.success).toBe(true);
    expect(explainResult.explanations.length).toBe(recResult.recommendations.length);
    expect(explainResult.llmFormatterInput).not.toBeNull();
    expect(explainResult.llmFormatterInput!.reasonCodes.length).toBeGreaterThan(0);
    expect(
      explainResult.explanations.every((e) =>
        e.reasons.every((r) => !r.statementKey.includes(" ")),
      ),
    ).toBe(true);
  });
});
