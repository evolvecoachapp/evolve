import { buildDecisionGraph } from "../builders/DecisionGraphBuilder";
import { buildDecisionSummary } from "../builders/DecisionSummaryBuilder";
import {
  createDecisionInput,
  createTestDecisionEngineService,
} from "../testSupport/fixtures";

describe("decision-engine builders", () => {
  it("builds immutable summary and graph", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const summary = buildDecisionSummary({
      id: "summary:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions: built.decisions,
      candidateCount: built.package!.candidates.length,
      conflictCount: 0,
      resolutionCount: 0,
      focusAreas: ["training"],
    });
    expect(Object.isFrozen(summary)).toBe(true);
    const graph = buildDecisionGraph({
      id: "graph:1",
      candidates: built.package!.candidates,
      decisions: built.decisions,
      dependencies: built.package!.dependencies,
    });
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(Object.isFrozen(graph)).toBe(true);
  });
});
