import {
  buildCoordinationPlan,
  processCoachRequest,
} from "../application";
import {
  createSupervisorRequest,
  createTestSupervisorService,
} from "../testSupport/fixtures";

describe("coach-supervisor integration", () => {
  it("runs end-to-end orchestration with mocked downstream ports", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest();

    const planned = buildCoordinationPlan({ service, request });
    expect(planned.success).toBe(true);
    expect(planned.plan?.coordination.orderedCapabilityIds.length).toBe(2);

    const processed = processCoachRequest({ service, request });
    expect(processed.success).toBe(true);
    expect(processed.response?.agentIds).toEqual([
      "agent:workout",
      "agent:recovery",
    ]);
    expect(processed.snapshot?.response).not.toBeNull();
    expect(processed.summary?.statistics.agentCount).toBe(2);
  });
});
