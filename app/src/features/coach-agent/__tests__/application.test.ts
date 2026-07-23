import {
  buildCoachingPlan,
  describeCoachCapabilities,
  evaluateCoachDecision,
  processCoachRequest,
  validateCoachPlan,
} from "../application";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createCoachRequestFixture,
  createTestAgentService,
  createWorkoutFocusRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-agent application", () => {
  it("describeCoachCapabilities returns frozen agent", () => {
    const service = createTestAgentService();
    const agent = describeCoachCapabilities({ service });
    expect(agent.name).toBe("Coach Agent");
    expect(agent.capabilities).toContain("meta_orchestration");
    expect(agent.supportedAgents).toContain(SpecialistAgentKinds.WORKOUT);
    expect(agent.futureAgents).toContain(SpecialistAgentKinds.SLEEP);
    expect(Object.isFrozen(agent)).toBe(true);
  });

  it("processCoachRequest returns immutable multi-agent result", () => {
    const service = createTestAgentService();
    const result = processCoachRequest({
      service,
      request: createCoachRequestFixture(),
    });
    expect(result.success).toBe(true);
    expect(result.decision.accepted).toBe(true);
    expect(result.plan.agentKinds.length).toBe(3);
    expect(result.outputs.workout).not.toBeNull();
    expect(result.outputs.recovery).not.toBeNull();
    expect(result.outputs.nutrition).not.toBeNull();
    expect(result.decision.recommendations.length).toBeGreaterThan(0);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.startedAt).toBe(FIXED_TIMESTAMP);
  });

  it("buildCoachingPlan / evaluate / validate work via public API", () => {
    const service = createTestAgentService();
    const plan = buildCoachingPlan({
      service,
      request: createWorkoutFocusRequest(),
    });
    expect(plan.agentKinds).toEqual([SpecialistAgentKinds.WORKOUT]);
    expect(validateCoachPlan({ service, plan }).valid).toBe(true);

    const result = processCoachRequest({
      service,
      request: createWorkoutFocusRequest(),
    });
    const evaluation = evaluateCoachDecision({
      service,
      decision: result.decision,
      requestId: result.request.id,
      planId: result.plan.id,
    });
    expect(evaluation.validation.valid).toBe(true);
    expect(evaluation.score).not.toBeNull();
    expect(Object.isFrozen(evaluation)).toBe(true);
  });
});
