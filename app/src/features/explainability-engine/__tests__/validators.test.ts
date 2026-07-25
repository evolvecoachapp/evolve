import { buildExplanationsFromPairs } from "../builders/ExplanationBuilder";
import { buildExplanationPackage } from "../builders/PackageBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { validateExplanationPackage } from "../validators";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine validators", () => {
  it("validates a complete explanation package", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const explanations = buildExplanationsFromPairs({
      decisions: createMockDecisionEnginePort().loadDecisions(portInput),
      recommendations: createMockRecommendationEnginePort().loadRecommendations(portInput),
      focusAreaKeys: Object.freeze([]),
      at: FIXED_TIMESTAMP,
    });
    const pkg = buildExplanationPackage({
      id: "pkg:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      explanations,
      summary: null,
      snapshot: null,
      graph: null,
      trace: null,
      timeline: null,
      llmFormatterInput: null,
      at: FIXED_TIMESTAMP,
    });
    const validation = validateExplanationPackage(pkg);
    expect(validation.valid).toBe(true);
  });
});
