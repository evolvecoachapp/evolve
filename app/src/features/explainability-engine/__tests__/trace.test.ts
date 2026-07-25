import { buildDecisionTrace } from "../trace/DecisionTraceBuilder";
import { buildExplanationGraph } from "../trace/GraphTraceBuilder";
import { buildExplanation } from "../builders/ExplanationBuilder";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("explainability-engine trace", () => {
  it("builds decision trace steps", () => {
    const decision = createMockDecisionEnginePort().loadDecisions({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })[0]!;
    const trace = buildDecisionTrace({ decision, at: FIXED_TIMESTAMP });
    expect(trace.steps.length).toBeGreaterThan(0);
    expect(Object.isFrozen(trace)).toBe(true);
  });

  it("builds explanation graph with nodes and edges", () => {
    const portInput = { athleteId: "athlete:1", sessionId: null, conversationId: null, contextId: "context:1", at: FIXED_TIMESTAMP };
    const decision = createMockDecisionEnginePort().loadDecisions(portInput)[0]!;
    const rec = createMockRecommendationEnginePort().loadRecommendations(portInput)[0]!;
    const explanation = buildExplanation({ decision, recommendation: rec, focusAreaKeys: Object.freeze(["training"]), at: FIXED_TIMESTAMP });
    const graph = buildExplanationGraph({ id: "graph:test", explanations: Object.freeze([explanation]), at: FIXED_TIMESTAMP });
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
