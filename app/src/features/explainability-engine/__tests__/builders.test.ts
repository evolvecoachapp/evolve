import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { buildLLMFormatterInput } from "../builders/LLMFormatterInputBuilder";
import { buildExplanationSummary } from "../builders/SummaryBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine builders", () => {
  const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };

  it("builds explanations from decision/recommendation pairs", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const explanations = buildExplanationsFromPairs({
      decisions,
      recommendations,
      focusAreaKeys: Object.freeze(["training"]),
      at: FIXED_TIMESTAMP,
    });
    expect(explanations.length).toBe(recommendations.length);
    expect(Object.isFrozen(explanations[0])).toBe(true);
  });

  it("builds LLMFormatterInput with structured keys only", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const explanations = buildExplanationsFromPairs({ decisions, recommendations, focusAreaKeys: Object.freeze([]), at: FIXED_TIMESTAMP });
    const summary = buildExplanationSummary({ id: "summary:1", athleteId: "athlete:1", contextId: "context:1", explanations, focusAreaKeys: Object.freeze([]), at: FIXED_TIMESTAMP });
    const llm = buildLLMFormatterInput({ id: "llm:1", athleteId: "athlete:1", contextId: "context:1", explanations, summary, at: FIXED_TIMESTAMP });
    expect(llm.reasonCodes.length).toBeGreaterThan(0);
    expect(llm.evidenceKeys.length).toBeGreaterThan(0);
    expect(Object.isFrozen(llm)).toBe(true);
  });
});
