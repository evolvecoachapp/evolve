import {
  buildExplanation,
  describeExplanation,
} from "../application";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import {
  createExplanationInput,
  createTestExplainabilityEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("explainability-engine regression", () => {
  it("is deterministic for identical inputs", () => {
    const a = createTestExplainabilityEngineService();
    const b = createTestExplainabilityEngineService();
    const input = createExplanationInput();
    const left = a.buildExplanation(input);
    const right = b.buildExplanation(input);
    expect(left.explanations.map((e) => e.id)).toEqual(
      right.explanations.map((e) => e.id),
    );
    expect(left.package!.statistics).toEqual(right.package!.statistics);
  });

  it("freezes all output models", () => {
    const service = createTestExplainabilityEngineService();
    const result = service.buildExplanation(createExplanationInput());
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.explanations)).toBe(true);
    expect(Object.isFrozen(result.explanations[0])).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.llmFormatterInput)).toBe(true);
  });

  it("does not mutate upstream decisions or recommendations", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const decisions = createMockDecisionEnginePort().loadDecisions(portInput);
    const recommendations = createMockRecommendationEnginePort().loadRecommendations(portInput);
    const decisionSnapshot = JSON.stringify(decisions);
    const recSnapshot = JSON.stringify(recommendations);

    buildExplanation({
      input: createExplanationInput({ decisions, recommendations }),
    });

    expect(JSON.stringify(decisions)).toBe(decisionSnapshot);
    expect(JSON.stringify(recommendations)).toBe(recSnapshot);
  });

  it("uses structured codes/keys only — no NL prose fields", () => {
    const result = buildExplanation({ input: createExplanationInput() });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toMatch(/openai|anthropic|http:\/\/|https:\/\//i);
    for (const e of result.explanations) {
      for (const r of e.reasons) {
        expect(r.statementKey).toMatch(/^[a-z0-9_.]+$/);
      }
    }
  });

  it("public API surface matches spec", () => {
    const caps = describeExplanation();
    expect(caps.capabilities).toHaveLength(5);
    expect(caps.boundaries).toContain("No NL generation");
  });
});
