import { planDecisions } from "../planning/DecisionPlanner";
import { planResolutions } from "../planning/ResolutionPlanner";
import {
  createDecisionInput,
  createTestDecisionEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("decision-engine planning", () => {
  it("plans ordered steps without execution", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    expect(built.success).toBe(true);
    const plan = planDecisions({
      planId: "plan:test",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions: built.decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(plan.steps.length).toBe(built.decisions.length);
    expect(plan.steps.every((s) => s.status === "planned")).toBe(true);
  });

  it("plans resolutions for conflicts", () => {
    const service = createTestDecisionEngineService();
    const built = service.buildDecision(createDecisionInput());
    const resolutions = planResolutions({
      conflicts: built.package!.conflicts,
      candidates: built.package!.candidates,
      at: FIXED_TIMESTAMP,
    });
    expect(resolutions.length).toBe(built.package!.conflicts.length);
  });
});
