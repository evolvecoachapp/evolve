import { buildRecommendationsFromDecisions } from "../builders/RecommendationBuilder";
import { buildRecommendationSummary } from "../builders/SummaryBuilder";
import { buildRecommendationSnapshot } from "../builders/SnapshotBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import {
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("recommendation-engine builders", () => {
  it("builds immutable recommendations from decisions", () => {
    const port = createMockDecisionEnginePort();
    const decisions = port.loadDecisions({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: "conversation:1",
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    });
    const recommendations = buildRecommendationsFromDecisions({
      decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(recommendations.length).toBe(decisions.length);
    expect(Object.isFrozen(recommendations[0])).toBe(true);
    expect(recommendations[0]?.decisionId).toBe(decisions[0]?.id);

    const summary = buildRecommendationSummary({
      id: "summary:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      recommendations,
      groupCount: 1,
      conflictCount: 0,
      resolutionCount: 0,
      focusAreas: Object.freeze(["training"]),
      at: FIXED_TIMESTAMP,
    });
    expect(summary.recommendationCount).toBe(recommendations.length);

    const snapshot = buildRecommendationSnapshot({
      id: "snapshot:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      recommendations,
      summary,
      at: FIXED_TIMESTAMP,
    });
    expect(snapshot.recommendations.length).toBe(recommendations.length);
  });
});
