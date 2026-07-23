import { CoachSupervisorExecutionStatuses } from "../models/CoachSupervisorExecution";
import {
  createSupervisorRequest,
  createTestSupervisorService,
} from "../testSupport/fixtures";

describe("coach-supervisor supervisor", () => {
  it("processes request through coordinator and produces execution summaries", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest();
    const result = service.processCoachRequest(request);

    expect(result.success).toBe(true);
    expect(result.plan).not.toBeNull();
    expect(result.execution?.agentSummaries.length).toBe(2);
    expect(result.context?.selectedAgentIds).toEqual([
      "agent:workout",
      "agent:recovery",
    ]);
    expect(result.execution?.status).toBe(
      CoachSupervisorExecutionStatuses.AGGREGATING,
    );
    expect(result.response).not.toBeNull();
  });

  it("fails on empty capabilities", () => {
    const service = createTestSupervisorService();
    const request = createSupervisorRequest({
      requiredCapabilityIds: [],
    });
    const result = service.processCoachRequest(request);
    expect(result.success).toBe(false);
    expect(result.error).not.toBeNull();
  });
});
