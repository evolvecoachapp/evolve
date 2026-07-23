import { processCoachRequest } from "../application";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import {
  createCoachRequestFixture,
  createMockActionPlan,
  createMockCoachResponse,
  createMockToolExecutionResult,
  createTestAgentService,
} from "../testSupport/fixtures";

describe("coach-agent integration", () => {
  it("consumes mocked CoachResponse, ActionPlan, ToolExecutionResult", () => {
    const service = createTestAgentService();
    const result = processCoachRequest({
      service,
      request: createCoachRequestFixture(),
      coachResponse: createMockCoachResponse(),
      actionPlan: createMockActionPlan(),
      toolExecutionResult: createMockToolExecutionResult(),
      memoryTurnCount: 3,
    });

    expect(result.context.coachResponse).not.toBeNull();
    expect(result.context.actionPlan).not.toBeNull();
    expect(result.context.toolExecutionResult).not.toBeNull();
    expect(result.context.memoryTurnCount).toBe(3);
    expect(result.success).toBe(true);
    expect(result.outputs.invocations.length).toBe(3);
  });

  it("supports single-agent coaching path", () => {
    const service = createTestAgentService();
    const result = processCoachRequest({
      service,
      request: createCoachRequestFixture({
        message: "Only recovery please",
        agentHints: Object.freeze([SpecialistAgentKinds.RECOVERY]),
      }),
    });
    expect(result.plan.agentKinds).toEqual([SpecialistAgentKinds.RECOVERY]);
    expect(result.outputs.recovery).not.toBeNull();
    expect(result.outputs.workout).toBeNull();
    expect(result.outputs.nutrition).toBeNull();
  });
});
