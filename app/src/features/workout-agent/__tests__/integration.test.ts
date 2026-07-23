import { processWorkoutRequest } from "../application";
import {
  createMockActionPlan,
  createMockCoachResponse,
  createMockToolExecutionResult,
  createTestAgentService,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { WorkoutObjectives } from "../models/WorkoutObjective";

describe("workout-agent integration", () => {
  it("consumes mocked CoachResponse, ActionPlan, ToolExecutionResult", () => {
    const service = createTestAgentService();
    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture(),
      coachResponse: createMockCoachResponse(),
      actionPlan: createMockActionPlan(),
      toolExecutionResult: createMockToolExecutionResult(),
      memoryTurnCount: 2,
    });

    expect(result.context.coachResponseId).toBe("coach:resp:1");
    expect(result.context.actionPlanId).toBe("action:plan:1");
    expect(result.context.toolResultIds).toContain("texec:result:1");
    expect(result.conversation.turnCount).toBe(2);
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.success).toBe(true);
  });

  it("recovery request selects recovery-oriented plan", () => {
    const service = createTestAgentService();
    const result = processWorkoutRequest({
      service,
      request: createWorkoutRequestFixture({
        message: "I need recovery and a deload week",
        objectiveHint: WorkoutObjectives.RECOVERY,
        intentHint: null,
        constraints: Object.freeze(["needs_recovery"]),
      }),
    });
    expect(result.context.objective).toBe(WorkoutObjectives.RECOVERY);
    expect(result.decision.proposal?.deloadRecommended).toBe(true);
  });
});
