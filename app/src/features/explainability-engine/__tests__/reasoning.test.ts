import { deriveDecisionReasons } from "../reasoning/DecisionReasoning";
import { deriveRecommendationReasons } from "../reasoning/RecommendationReasoning";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine reasoning", () => {
  it("derives structured decision reasons", () => {
    const decisions = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const reasons = deriveDecisionReasons({ decision: decisions[0]! });
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons.every((r) => r.statementKey.startsWith("decision."))).toBe(true);
    expect(Object.isFrozen(reasons)).toBe(true);
  });

  it("derives structured recommendation reasons", () => {
    const recs = createMockRecommendationEnginePort().loadRecommendations({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const reasons = deriveRecommendationReasons({ recommendation: recs[0]! });
    expect(reasons.some((r) => r.statementKey.startsWith("recommendation."))).toBe(true);
  });
});
