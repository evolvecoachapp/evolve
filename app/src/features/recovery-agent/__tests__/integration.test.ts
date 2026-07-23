import { processRecoveryRequest } from "../application";
import {
  createTestAgentService,
  createRecoveryRequestFixture,
  createMockCoachResponse,
  createMockActionPlan,
  createMockToolExecutionResult,
} from "../testSupport/fixtures";

describe("recovery-agent integration", () => {
  it("processes with mocked downstream artifacts", () => {
    const service = createTestAgentService();
    const result = processRecoveryRequest({
      service,
      request: createRecoveryRequestFixture(),
      coachResponse: createMockCoachResponse(),
      actionPlan: createMockActionPlan(),
      toolExecutionResult: createMockToolExecutionResult(),
      memoryTurnCount: 3,
    });
    expect(result.success).toBe(true);
    expect(result.context.attributes.hasCoachResponse).toBe(true);
    expect(result.reasoning.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
