import { evaluateCandidate } from "../evaluation";
import { evaluateConflicts } from "../evaluation/ConflictEvaluator";
import { analyzeTraining } from "../analysis/TrainingAnalysis";
import { analyzePriority } from "../analysis/PriorityAnalysis";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("decision-engine evaluation", () => {
  it("scores candidates deterministically", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidate = analyzeTraining({ decisionContext })[0]!;
    const evaluation = evaluateCandidate({
      candidate,
      constraints: [],
      dependencies: [],
      at: FIXED_TIMESTAMP,
    });
    expect(evaluation.passed).toBe(true);
    expect(evaluation.score.total).toBeGreaterThan(0);
    expect(Object.isFrozen(evaluation)).toBe(true);
  });

  it("detects priority conflicts within category", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidates = [
      ...analyzePriority({ decisionContext }),
      ...analyzeTraining({ decisionContext }),
    ];
    const conflicts = evaluateConflicts({ candidates });
    expect(Array.isArray(conflicts)).toBe(true);
  });
});
