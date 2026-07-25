import { buildDecisionEvidence } from "../evidence/DecisionEvidence";
import { buildRecommendationEvidence } from "../evidence/RecommendationEvidence";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { ExplanationEvidenceKinds } from "../models/ExplanationEvidence";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine evidence", () => {
  it("builds decision evidence with structured keys", () => {
    const decision = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const evidence = buildDecisionEvidence({ decision });
    expect(evidence[0]!.kind).toBe(ExplanationEvidenceKinds.DECISION);
    expect(Object.isFrozen(evidence)).toBe(true);
  });

  it("builds recommendation evidence", () => {
    const rec = createMockRecommendationEnginePort().loadRecommendations({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const evidence = buildRecommendationEvidence({ recommendation: rec });
    expect(evidence[0]!.kind).toBe(ExplanationEvidenceKinds.RECOMMENDATION);
  });
});
