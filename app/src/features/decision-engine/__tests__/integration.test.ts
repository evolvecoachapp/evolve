import { buildUnifiedContext } from "../../context-fusion/application";
import { ContextRequestKinds } from "../../context-fusion/models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../../context-fusion/testSupport/fixtures";
import { buildDecisionContext } from "../builders/DecisionContextBuilder";
import { DecisionInputKinds } from "../models/DecisionInput";
import {
  createDecisionInput,
  createTestDecisionEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("decision-engine integration", () => {
  it("consumes Context Fusion UnifiedCoachingContext", () => {
    const fusion = createTestContextFusionService();
    const fused = buildUnifiedContext({
      service: fusion,
      request: createContextRequest({ kind: ContextRequestKinds.BUILD }),
    });
    expect(fused.success).toBe(true);
    expect(fused.context).not.toBeNull();

    const decisionContext = buildDecisionContext({
      id: "dc:integration",
      unified: fused.context!,
      handoff: fused.decisionEngineContext,
      at: FIXED_TIMESTAMP,
    });

    const service = createTestDecisionEngineService();
    const result = service.buildDecision(
      createDecisionInput({
        kind: DecisionInputKinds.BUILD,
        decisionContext,
        athleteId: fused.context!.athleteId,
        contextId: fused.context!.id,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(result.recommendationInput).not.toBeNull();
    expect(result.decisions.every((d) => d.contextId === fused.context!.id)).toBe(
      true,
    );
  });
});
