import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine policies", () => {
  it("elevates safety explanation priority", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const explanations = buildExplanationsFromPairs({
      decisions: createMockDecisionEnginePort().loadDecisions(portInput),
      recommendations: createMockRecommendationEnginePort().loadRecommendations(portInput),
      focusAreaKeys: Object.freeze([]),
      at: FIXED_TIMESTAMP,
    });
    const adjusted = applySafetyPolicy(explanations);
    const safety = adjusted.find((e) => e.recommendationLink.category === "safety");
    expect(safety!.priority.ordinal).toBe(0);
  });
});
