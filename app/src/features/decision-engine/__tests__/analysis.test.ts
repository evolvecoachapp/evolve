import { analyzeTraining } from "../analysis/TrainingAnalysis";
import { analyzeRisk } from "../analysis/RiskAnalysis";
import { analyzeContext } from "../analysis/ContextAnalysis";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("decision-engine analysis", () => {
  it("emits training candidate when workout slice present", () => {
    const port = createMockContextFusionPort();
    const unified = port.loadUnifiedContext({
      athleteId: "athlete:1",
      sessionId: "session:1",
      conversationId: "conversation:1",
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    })!;
    const decisionContext = buildDecisionContext({
      id: "dc:1",
      unified,
      handoff: null,
      at: FIXED_TIMESTAMP,
    });
    const candidates = analyzeTraining({ decisionContext });
    expect(candidates).toHaveLength(1);
    expect(candidates[0]!.category).toBe("training");
    expect(Object.isFrozen(candidates[0])).toBe(true);
  });

  it("emits safety block when recovery missing", () => {
    const port = createMockContextFusionPort({ recovery: null });
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
    expect(analyzeRisk({ decisionContext })[0]!.intent).toBe("block");
    expect(analyzeContext({ decisionContext }).hasAthlete).toBe(true);
  });
});
