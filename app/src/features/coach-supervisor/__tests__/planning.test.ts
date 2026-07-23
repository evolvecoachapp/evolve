import { createMockRoutingPort } from "../contracts/RoutingPort";
import { createSupervisorPlanner } from "../planning/SupervisorPlanner";
import { createCoordinationPlanner } from "../planning/CoordinationPlanner";
import { createExecutionPlanner } from "../planning/ExecutionPlanner";
import {
  createSupervisorRequest,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("coach-supervisor planning", () => {
  it("builds deterministic supervisor and coordination plans", () => {
    const request = createSupervisorRequest();
    const routing = createMockRoutingPort().resolve(request);
    const planner = createSupervisorPlanner();
    const plan = planner.plan({
      request,
      routing,
      planId: "splan:test",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(plan.id).toBe("splan:test");
    expect(plan.coordination.orderedAgentIds).toEqual([
      "agent:workout",
      "agent:recovery",
    ]);

    const coordination = createCoordinationPlanner().plan({
      request,
      routing,
      planId: "cplan:test",
      createdAt: FIXED_TIMESTAMP,
    });
    const steps = createExecutionPlanner().plan(coordination);
    expect(steps.length).toBe(2);
    expect(steps[0]?.agentId).toBe("agent:workout");
  });
});
