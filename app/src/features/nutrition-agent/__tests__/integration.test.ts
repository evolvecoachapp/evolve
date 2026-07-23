import { processNutritionRequest } from "../application";
import {
  createMockActionPlan,
  createMockCoachResponse,
  createMockToolExecutionResult,
  createTestAgentService,
  createNutritionRequestFixture,
} from "../testSupport/fixtures";
import { NutritionGoals } from "../models/NutritionGoal";

describe("nutrition-agent integration", () => {
  it("consumes mocked CoachResponse, ActionPlan, ToolExecutionResult", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture(),
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

  it("muscle gain request selects surplus-oriented plan", () => {
    const service = createTestAgentService();
    const result = processNutritionRequest({
      service,
      request: createNutritionRequestFixture({
        message: "I want to bulk and gain muscle",
        goalHint: NutritionGoals.MUSCLE_GAIN,
        intentHint: null,
      }),
    });
    expect(result.context.goal).toBe(NutritionGoals.MUSCLE_GAIN);
    expect(result.decision.plan?.phaseHint).toBe("bulk");
    expect(result.decision.plan?.calorieTargets.deficitOrSurplus).toBeGreaterThan(
      0,
    );
  });
});
