import { processCoachRequest } from "../application";
import {
  createSupervisorRequest,
  createTestSupervisorService,
} from "../testSupport/fixtures";

describe("coach-supervisor regression", () => {
  it("never invents domain business logic in unified response", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest({
      intent: "Help with nutrition",
      requiredCapabilityIds: ["AnalyzeNutrition"],
    });
    const result = processCoachRequest({ service, request });
    expect(result.success).toBe(true);
    expect(result.response?.agentIds).toEqual(["agent:nutrition"]);
    // Response is structural merge of mock messages only
    expect(result.response?.sections[0]).toContain("agent:nutrition");
    expect(result.response?.message).not.toMatch(/calories|macros|protein/i);
  });

  it("is deterministic across repeated process calls", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest();
    const a = processCoachRequest({ service, request });
    const b = processCoachRequest({ service, request });
    expect(a.response?.message).toBe(b.response?.message);
    expect(a.plan?.coordination.orderedAgentIds).toEqual(
      b.plan?.coordination.orderedAgentIds,
    );
  });
});
